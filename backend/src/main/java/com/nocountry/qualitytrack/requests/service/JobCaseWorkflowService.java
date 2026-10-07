package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.requests.dto.request.CreateCaseInformationRequest;
import com.nocountry.qualitytrack.requests.dto.request.DefineCaseMaterialSpecificationRequest;
import com.nocountry.qualitytrack.requests.dto.request.RespondCaseInformationRequest;
import com.nocountry.qualitytrack.requests.dto.response.CaseInformationRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.CaseMaterialSpecificationResponse;
import com.nocountry.qualitytrack.requests.dto.response.CustomerInformationRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.JobCaseResponse;
import com.nocountry.qualitytrack.requests.entity.CaseInformationRequest;
import com.nocountry.qualitytrack.requests.entity.CaseMaterialSpecification;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.requests.repository.CaseInformationRequestRepository;
import com.nocountry.qualitytrack.requests.repository.CaseMaterialSpecificationRepository;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class JobCaseWorkflowService {

    private final JobCaseRepository jobCaseRepository;
    private final CaseInformationRequestRepository informationRequestRepository;
    private final CaseMaterialSpecificationRepository materialSpecificationRepository;
    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;
    private final CustomerMembershipRepository customerMembershipRepository;
    private final TraceabilityService traceabilityService;

    @Transactional
    public JobCaseResponse take(Long currentUserId, Long caseId) {
        User actor = requireInternalRole(currentUserId, SystemRole.COMMERCIAL, SystemRole.ADMIN);
        JobCase jobCase = requireCaseForUpdate(caseId);

        if (jobCase.getStatus() != JobCaseStatus.SUBMITTED) {
            conflict("Solo se puede tomar un expediente en estado SUBMITTED.");
        }
        if (jobCase.getAssignedToUser() != null) {
            conflict("El expediente ya tiene un responsable asignado.");
        }

        JobCaseStatus previousStatus = jobCase.getStatus();
        jobCase.takeForReview(actor, Instant.now());
        jobCaseRepository.saveAndFlush(jobCase);

        recordStatusEvent(
                jobCase,
                TraceabilityEventType.JOB_CASE_REVIEW_STARTED,
                previousStatus,
                currentUserId,
                metadata(
                        "caseNumber", jobCase.getCaseNumber(),
                        "assignedToUserId", actor.getId(),
                        "assignedToName", fullName(actor)
                )
        );

        return JobCaseResponse.from(jobCase);
    }

    @Transactional
    public CaseInformationRequestResponse requestInformation(
            Long currentUserId,
            Long caseId,
            CreateCaseInformationRequest input
    ) {
        User actor = requireInternalRole(currentUserId, SystemRole.COMMERCIAL, SystemRole.ADMIN);
        JobCase jobCase = requireCaseForUpdate(caseId);
        requireAssignedCommercialOrAdmin(currentUserId, jobCase);

        if (jobCase.getStatus() != JobCaseStatus.UNDER_REVIEW) {
            conflict("Solo se puede solicitar información mientras el expediente está en revisión.");
        }
        if (informationRequestRepository.existsByJobCase_IdAndRespondedAtIsNull(caseId)) {
            conflict("El expediente ya tiene una solicitud de información pendiente.");
        }

        CaseInformationRequest informationRequest = CaseInformationRequest.open(
                jobCase,
                input.question(),
                actor,
                Instant.now()
        );
        informationRequest = informationRequestRepository.saveAndFlush(informationRequest);

        JobCaseStatus previousStatus = jobCase.getStatus();
        jobCase.waitForCustomerInfo();
        jobCaseRepository.saveAndFlush(jobCase);

        recordStatusEvent(
                jobCase,
                TraceabilityEventType.CUSTOMER_INFORMATION_REQUESTED,
                previousStatus,
                currentUserId,
                metadata(
                        "caseNumber", jobCase.getCaseNumber(),
                        "requestNumber", jobCase.getCustomerRequest().getRequestNumber(),
                        "informationRequestId", informationRequest.getId(),
                        "question", informationRequest.getQuestion()
                )
        );

        return CaseInformationRequestResponse.from(informationRequest);
    }

    @Transactional
    public CustomerInformationRequestResponse respondInformation(
            Long currentUserId,
            Long customerId,
            Long requestId,
            Long informationRequestId,
            RespondCaseInformationRequest input
    ) {
        CustomerMembership membership = requireCustomerResponder(currentUserId, customerId);
        JobCase jobCase = jobCaseRepository
                .findByRequestAndCustomerForUpdate(requestId, customerId)
                .orElseThrow(() -> notFound("No se encontró la solicitud."));

        if (jobCase.getStatus() != JobCaseStatus.WAITING_CUSTOMER_INFO) {
            conflict("El expediente no está esperando información del cliente.");
        }

        CaseInformationRequest informationRequest = informationRequestRepository
                .findByIdAndJobCase_Id(informationRequestId, jobCase.getId())
                .orElseThrow(() -> notFound("No se encontró la solicitud de información."));

        if (!informationRequest.isOpen()) {
            conflict("La solicitud de información ya no está abierta.");
        }

        informationRequest.respond(input.response(), membership.getUser(), Instant.now());
        informationRequest = informationRequestRepository.saveAndFlush(informationRequest);

        JobCaseStatus previousStatus = jobCase.getStatus();
        jobCase.resumeReview();
        jobCaseRepository.saveAndFlush(jobCase);

        recordStatusEvent(
                jobCase,
                TraceabilityEventType.CUSTOMER_INFORMATION_RESPONDED,
                previousStatus,
                currentUserId,
                metadata(
                        "caseNumber", jobCase.getCaseNumber(),
                        "requestNumber", jobCase.getCustomerRequest().getRequestNumber(),
                        "informationRequestId", informationRequest.getId(),
                        "question", informationRequest.getQuestion()
                )
        );

        return CustomerInformationRequestResponse.from(informationRequest);
    }

    @Transactional
    public CaseMaterialSpecificationResponse defineMaterialSpecification(
            Long currentUserId,
            Long caseId,
            DefineCaseMaterialSpecificationRequest input
    ) {
        User actor = requireInternalRole(currentUserId, SystemRole.ENGINEERING, SystemRole.ADMIN);
        JobCase jobCase = requireCaseForUpdate(caseId);

        if (jobCase.getStatus() != JobCaseStatus.UNDER_REVIEW) {
            conflict("La especificación técnica solo puede definirse durante la revisión.");
        }

        Instant now = Instant.now();
        CaseMaterialSpecification specification = materialSpecificationRepository
                .findByJobCase_Id(caseId)
                .map(existing -> {
                    existing.redefine(
                            input.materialName(),
                            input.standardOrGrade(),
                            input.technicalNotes(),
                            actor,
                            now
                    );
                    return existing;
                })
                .orElseGet(() -> CaseMaterialSpecification.define(
                        jobCase,
                        input.materialName(),
                        input.standardOrGrade(),
                        input.technicalNotes(),
                        actor,
                        now
                ));

        specification = materialSpecificationRepository.saveAndFlush(specification);

        traceabilityService.record(
                jobCase,
                TraceabilityAggregateType.JOB_CASE,
                jobCase.getId(),
                TraceabilityEventType.MATERIAL_SPECIFICATION_DEFINED,
                null,
                null,
                currentUserId,
                metadata(
                        "caseNumber", jobCase.getCaseNumber(),
                        "materialName", specification.getMaterialName(),
                        "standardOrGrade", specification.getStandardOrGrade()
                )
        );

        return CaseMaterialSpecificationResponse.from(specification);
    }

    @Transactional
    public JobCaseResponse completeReview(Long currentUserId, Long caseId) {
        requireInternalRole(currentUserId, SystemRole.COMMERCIAL, SystemRole.ADMIN);
        JobCase jobCase = requireCaseForUpdate(caseId);
        requireAssignedCommercialOrAdmin(currentUserId, jobCase);

        if (jobCase.getStatus() != JobCaseStatus.UNDER_REVIEW) {
            conflict("Solo se puede completar una revisión que esté en UNDER_REVIEW.");
        }
        if (informationRequestRepository.existsByJobCase_IdAndRespondedAtIsNull(caseId)) {
            conflict("No se puede completar la revisión mientras exista información pendiente del cliente.");
        }
        if (jobCase.getCustomerRequest().getMaterialRequirementType() == MaterialRequirementType.ASSISTANCE_REQUIRED
                && materialSpecificationRepository.findByJobCase_Id(caseId).isEmpty()) {
            conflict("Debe definirse la especificación de material antes de preparar la cotización.");
        }

        JobCaseStatus previousStatus = jobCase.getStatus();
        jobCase.markReadyForQuotation();
        jobCaseRepository.saveAndFlush(jobCase);

        recordStatusEvent(
                jobCase,
                TraceabilityEventType.JOB_CASE_READY_FOR_QUOTATION,
                previousStatus,
                currentUserId,
                metadata(
                        "caseNumber", jobCase.getCaseNumber(),
                        "requestNumber", jobCase.getCustomerRequest().getRequestNumber()
                )
        );

        return JobCaseResponse.from(jobCase);
    }

    private JobCase requireCaseForUpdate(Long caseId) {
        return jobCaseRepository.findByIdForUpdate(caseId)
                .orElseThrow(() -> notFound("No se encontró el expediente."));
    }

    private User requireInternalRole(Long userId, SystemRole... allowedRoles) {
        User user = requireUser(userId);
        if (user.getAccountType() != AccountType.INTERNAL) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Esta operación está disponible únicamente para usuarios internos autorizados."
            );
        }

        boolean allowed = userSystemRoleRepository.findAllByIdUserId(userId)
                .stream()
                .map(role -> role.getRole())
                .anyMatch(role -> contains(allowedRoles, role));

        if (!allowed) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Tu rol interno no permite realizar esta acción sobre el expediente."
            );
        }
        return user;
    }

    private void requireAssignedCommercialOrAdmin(Long currentUserId, JobCase jobCase) {
        boolean admin = userSystemRoleRepository.existsByIdUserIdAndIdRole(currentUserId, SystemRole.ADMIN);
        if (admin) {
            return;
        }

        if (jobCase.getAssignedToUser() == null
                || !currentUserId.equals(jobCase.getAssignedToUser().getId())) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo el responsable asignado puede realizar esta acción sobre el expediente."
            );
        }
    }

    private CustomerMembership requireCustomerResponder(Long userId, Long customerId) {
        CustomerMembership membership = customerMembershipRepository
                .findByCustomer_IdAndUser_IdAndStatus(
                        customerId,
                        userId,
                        CustomerMembershipStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "No tienes acceso a esta empresa."
                ));

        if (membership.getRole() != CustomerMembershipRole.ADMIN
                && membership.getRole() != CustomerMembershipRole.REQUESTER) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Tu rol dentro de la empresa no permite responder solicitudes de información."
            );
        }
        return membership;
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> notFound("No se encontró el usuario autenticado."));
    }

    private void recordStatusEvent(
            JobCase jobCase,
            TraceabilityEventType eventType,
            JobCaseStatus previousStatus,
            Long currentUserId,
            Map<String, Object> metadata
    ) {
        traceabilityService.record(
                jobCase,
                TraceabilityAggregateType.JOB_CASE,
                jobCase.getId(),
                eventType,
                previousStatus.name(),
                jobCase.getStatus().name(),
                currentUserId,
                metadata
        );
    }

    private boolean contains(SystemRole[] allowedRoles, SystemRole role) {
        for (SystemRole allowedRole : allowedRoles) {
            if (allowedRole == role) {
                return true;
            }
        }
        return false;
    }

    private Map<String, Object> metadata(Object... entries) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        for (int index = 0; index < entries.length; index += 2) {
            String key = (String) entries[index];
            Object value = entries[index + 1];
            if (value != null) {
                metadata.put(key, value);
            }
        }
        return metadata;
    }

    private String fullName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }

    private BusinessException notFound(String message) {
        return new BusinessException(ApiErrorCode.RESOURCE_NOT_FOUND, message);
    }

    private void conflict(String message) {
        throw new BusinessException(ApiErrorCode.DATA_CONFLICT, message);
    }
}
