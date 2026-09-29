package com.nocountry.qualitytrack.deliveries.service;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
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
public class DeliveryAccessPolicy {

    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;
    private final CustomerMembershipRepository membershipRepository;

    public User requireLogisticsActor(Long userId) {
        User user = requireUser(userId);
        if (user.getAccountType() != AccountType.INTERNAL) {
            denied("Esta operación está disponible únicamente para usuarios internos.");
        }

        boolean allowed = userSystemRoleRepository.findAllByIdUserId(userId)
                .stream()
                .map(UserSystemRole::getRole)
                .anyMatch(role -> role == SystemRole.ADMIN || role == SystemRole.LOGISTICS);

        if (!allowed) {
            denied("Tu rol interno no permite gestionar entregas.");
        }
        return user;
    }

    public void requireInternalReader(Long userId) {
        User user = requireUser(userId);
        if (user.getAccountType() != AccountType.INTERNAL) {
            denied("Esta consulta está disponible únicamente para usuarios internos.");
        }

        boolean allowed = userSystemRoleRepository.findAllByIdUserId(userId)
                .stream()
                .map(UserSystemRole::getRole)
                .anyMatch(this::canReadInternally);

        if (!allowed) {
            denied("Tu rol interno no permite consultar entregas.");
        }
    }

    public User requireCustomerReader(Long userId, Long customerId) {
        return requireActiveCustomerMembership(userId, customerId).getUser();
    }

    private CustomerMembership requireActiveCustomerMembership(Long userId, Long customerId) {
        return membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                        customerId,
                        userId,
                        CustomerMembershipStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "No tienes acceso a esta empresa."
                ));
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el usuario autenticado."
                ));
    }

    private boolean canReadInternally(SystemRole role) {
        return role == SystemRole.ADMIN
                || role == SystemRole.COMMERCIAL
                || role == SystemRole.ENGINEERING
                || role == SystemRole.PRODUCTION
                || role == SystemRole.QUALITY
                || role == SystemRole.LOGISTICS
                || role == SystemRole.AUDITOR;
    }

    private void denied(String message) {
        throw new BusinessException(ApiErrorCode.ACCESS_DENIED, message);
    }
}
