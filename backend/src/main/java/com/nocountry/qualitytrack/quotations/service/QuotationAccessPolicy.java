package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class QuotationAccessPolicy {

    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;
    private final CustomerMembershipRepository customerMembershipRepository;

    public User requireCommercialActor(Long userId) {
        User user = requireInternalUser(userId);
        if (!hasAnyRole(userId, SystemRole.COMMERCIAL, SystemRole.ADMIN)) {
            denied("Tu rol interno no permite gestionar cotizaciones.");
        }
        return user;
    }

    public void requireInternalReader(Long userId) {
        requireInternalUser(userId);
        if (!hasAnyRole(userId, SystemRole.ADMIN, SystemRole.COMMERCIAL, SystemRole.AUDITOR)) {
            denied("Tu rol interno no permite consultar cotizaciones.");
        }
    }

    public void requireAssignedCommercialOrAdmin(Long userId, JobCase jobCase) {
        if (userSystemRoleRepository.existsByIdUserIdAndIdRole(userId, SystemRole.ADMIN)) {
            return;
        }

        if (jobCase.getAssignedToUser() == null
                || !userId.equals(jobCase.getAssignedToUser().getId())) {
            denied("Solo el responsable comercial del expediente puede realizar esta acción.");
        }
    }

    public CustomerMembership requireCustomerReader(Long userId, Long customerId) {
        return customerMembershipRepository
                .findByCustomer_IdAndUser_IdAndStatus(
                        customerId,
                        userId,
                        CustomerMembershipStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "No tienes acceso a esta empresa."
                ));
    }

    public CustomerMembership requireCustomerDecisionActor(Long userId, Long customerId) {
        CustomerMembership membership = requireCustomerReader(userId, customerId);
        if (membership.getRole() != CustomerMembershipRole.ADMIN
                && membership.getRole() != CustomerMembershipRole.REQUESTER) {
            denied("Tu rol dentro de la empresa no permite responder cotizaciones.");
        }
        return membership;
    }

    private User requireInternalUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el usuario autenticado."
                ));

        if (user.getAccountType() != AccountType.INTERNAL) {
            denied("Esta operación está disponible únicamente para usuarios internos autorizados.");
        }
        return user;
    }

    private boolean hasAnyRole(Long userId, SystemRole... roles) {
        return userSystemRoleRepository.findAllByIdUserId(userId)
                .stream()
                .map(UserSystemRole::getRole)
                .anyMatch(role -> contains(roles, role));
    }

    private boolean contains(SystemRole[] roles, SystemRole role) {
        for (SystemRole allowed : roles) {
            if (allowed == role) {
                return true;
            }
        }
        return false;
    }

    private void denied(String message) {
        throw new BusinessException(ApiErrorCode.ACCESS_DENIED, message);
    }
}
