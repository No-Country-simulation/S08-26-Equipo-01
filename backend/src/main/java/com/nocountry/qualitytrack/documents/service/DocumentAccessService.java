package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DocumentAccessService {

    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;
    private static final String DELIVERY_EVIDENCE_TYPE = "DELIVERY_EVIDENCE";
    private static final String MATERIAL_CERTIFICATE_TYPE = "MATERIAL_CERTIFICATE";

    private final CustomerMembershipRepository membershipRepository;
    private final DeliveryRepository deliveryRepository;

    public User requireInternalReader(Long userId) {
        User user = requireUser(userId);
        if (user.getAccountType() != AccountType.INTERNAL) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "El centro documental está disponible únicamente para usuarios internos."
            );
        }

        requireInternalRole(userId, false);
        return user;
    }

    public User requireCanCreate(Long userId, JobCase jobCase) {
        User user = requireUser(userId);

        if (user.getAccountType() == AccountType.INTERNAL) {
            requireInternalRole(userId, true);
            requireOpenForInternalWrite(jobCase);
            return user;
        }

        CustomerMembership membership = requireActiveMembership(userId, jobCase);
        requireCustomerWriteRole(membership);
        requireOpenForCustomerWrite(jobCase);
        return user;
    }

    public User requireCanCreate(Long userId, JobCase jobCase, String documentType) {
        User user = requireUser(userId);

        if (user.getAccountType() == AccountType.INTERNAL) {
            requireInternalDocumentWriteRole(userId, documentType);
            requireOpenForInternalWrite(jobCase);
            return user;
        }

        CustomerMembership membership = requireActiveMembership(userId, jobCase);
        requireCustomerWriteRole(membership);
        requireOpenForCustomerWrite(jobCase);
        return user;
    }

    public User requireCanReadCase(Long userId, JobCase jobCase) {
        User user = requireUser(userId);

        if (user.getAccountType() == AccountType.INTERNAL) {
            requireInternalRole(userId, false);
            return user;
        }

        requireActiveMembership(userId, jobCase);
        return user;
    }

    public User requireCanAddVersion(Long userId, Document document) {
        User user = requireUser(userId);
        JobCase jobCase = requireCase(document);

        if (user.getAccountType() == AccountType.INTERNAL) {
            requireInternalDocumentWriteRole(userId, document.getDocumentType());
            requireOpenForInternalWrite(jobCase);
            return user;
        }

        CustomerMembership membership = requireActiveMembership(userId, jobCase);
        requireCustomerWriteRole(membership);
        requireCustomerOwnedDocument(document);
        requireOpenForCustomerWrite(jobCase);
        return user;
    }

    public User requireCanRemove(Long userId, Document document) {
        User user = requireUser(userId);
        JobCase jobCase = requireCase(document);

        if (user.getAccountType() == AccountType.INTERNAL) {
            requireInternalDocumentWriteRole(userId, document.getDocumentType());
            requireOpenForInternalWrite(jobCase);
            return user;
        }

        CustomerMembership membership = requireActiveMembership(userId, jobCase);
        requireCustomerWriteRole(membership);
        requireCustomerOwnedDocument(document);
        requireOpenForCustomerWrite(jobCase);
        return user;
    }

    public User requireCanRead(Long userId, Document document) {
        User user = requireUser(userId);
        JobCase jobCase = requireCase(document);

        if (user.getAccountType() == AccountType.INTERNAL) {
            requireInternalRole(userId, false);
            return user;
        }

        requireActiveMembership(userId, jobCase);
        requireCustomerOwnedDocument(document);
        return user;
    }

    public User requireCanReadVersion(Long userId, DocumentVersion version) {
        User user = requireUser(userId);
        Document document = version.getDocument();
        JobCase jobCase = requireCase(document);

        if (user.getAccountType() == AccountType.INTERNAL) {
            requireInternalRole(userId, false);
            return user;
        }

        CustomerMembership membership = requireActiveMembership(userId, jobCase);
        if (document.getCreatedBy().getAccountType() == AccountType.CUSTOMER) {
            return user;
        }

        if (!DELIVERY_EVIDENCE_TYPE.equals(document.getDocumentType())) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Este documento es de uso interno y no está disponible para cuentas de cliente."
            );
        }

        Long customerId = membership.getCustomer().getId();
        boolean visible = deliveryRepository
                .findAllByEvidenceDocumentVersion_IdAndWorkOrder_JobCase_CustomerRequest_Customer_Id(
                        version.getId(),
                        customerId
                )
                .stream()
                .anyMatch(this::isCustomerVisibleDelivery);

        if (!visible) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "La evidencia no está vinculada a un envío visible para el cliente."
            );
        }

        return user;
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el usuario autenticado."
                ));
    }

    private JobCase requireCase(Document document) {
        if (document.getJobCase() == null) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "El documento no pertenece a un expediente accesible."
            );
        }
        return document.getJobCase();
    }

    private CustomerMembership requireActiveMembership(Long userId, JobCase jobCase) {
        Long customerId = jobCase.getCustomerRequest().getCustomer().getId();
        return membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                        customerId,
                        userId,
                        CustomerMembershipStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "No tienes acceso a los documentos de esta empresa."
                ));
    }

    private void requireCustomerWriteRole(CustomerMembership membership) {
        if (membership.getRole() != CustomerMembershipRole.ADMIN
                && membership.getRole() != CustomerMembershipRole.REQUESTER) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Tu rol dentro de la empresa no permite modificar documentos."
            );
        }
    }

    private void requireCustomerOwnedDocument(Document document) {
        if (document.getCreatedBy().getAccountType() != AccountType.CUSTOMER) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Este documento es de uso interno y no está disponible para cuentas de cliente."
            );
        }
    }

    private void requireInternalRole(Long userId, boolean write) {
        boolean allowed = userSystemRoleRepository.findAllByIdUserId(userId)
                .stream()
                .map(UserSystemRole::getRole)
                .anyMatch(role -> write ? canWriteInternalDocuments(role) : canReadInternalDocuments(role));

        if (!allowed) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    write
                            ? "Tu rol interno no permite modificar documentos."
                            : "Tu rol interno no permite consultar documentos."
            );
        }
    }

    private void requireInternalDocumentWriteRole(Long userId, String documentType) {
        boolean allowed = userSystemRoleRepository.findAllByIdUserId(userId)
                .stream()
                .map(UserSystemRole::getRole)
                .anyMatch(role -> canWriteInternalDocuments(role)
                        || (role == SystemRole.LOGISTICS
                        && DELIVERY_EVIDENCE_TYPE.equals(documentType))
                        || (role == SystemRole.PRODUCTION
                        && MATERIAL_CERTIFICATE_TYPE.equals(documentType)));

        if (!allowed) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Tu rol interno no permite modificar este tipo de documento."
            );
        }
    }

    private boolean isCustomerVisibleDelivery(Delivery delivery) {
        return delivery.getStatus() == DeliveryStatus.DISPATCHED
                || delivery.getStatus() == DeliveryStatus.DELIVERED
                || (delivery.getStatus() == DeliveryStatus.CANCELLED
                && delivery.getDispatchedAt() != null);
    }

    private void requireOpenForCustomerWrite(JobCase jobCase) {
        if (jobCase.getStatus() == JobCaseStatus.READY_FOR_QUOTATION
                || jobCase.getStatus() == JobCaseStatus.IN_PRODUCTION
                || jobCase.getStatus() == JobCaseStatus.CANCELLED) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "El expediente ya no admite modificaciones de documentos por parte del cliente."
            );
        }
    }

    private void requireOpenForInternalWrite(JobCase jobCase) {
        if (jobCase.getStatus() == JobCaseStatus.CANCELLED) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "No se pueden modificar documentos de un expediente cancelado."
            );
        }
    }

    private boolean canReadInternalDocuments(SystemRole role) {
        return role == SystemRole.ADMIN
                || role == SystemRole.COMMERCIAL
                || role == SystemRole.ENGINEERING
                || role == SystemRole.PRODUCTION
                || role == SystemRole.QUALITY
                || role == SystemRole.LOGISTICS
                || role == SystemRole.AUDITOR;
    }

    private boolean canWriteInternalDocuments(SystemRole role) {
        return role == SystemRole.ADMIN
                || role == SystemRole.COMMERCIAL
                || role == SystemRole.ENGINEERING;
    }
}
