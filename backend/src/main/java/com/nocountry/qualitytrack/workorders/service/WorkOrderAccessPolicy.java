package com.nocountry.qualitytrack.workorders.service;

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
public class WorkOrderAccessPolicy {

    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;

    public User requireCreationActor(Long userId) {
        User user = requireInternalUser(userId);
        if (!hasAnyRole(
                userId,
                SystemRole.ADMIN,
                SystemRole.COMMERCIAL
        )) {
            denied("Tu rol interno no permite crear órdenes de trabajo.");
        }
        return user;
    }

    public User requirePlanningActor(Long userId) {
        User user = requireInternalUser(userId);
        if (!hasAnyRole(
                userId,
                SystemRole.ADMIN,
                SystemRole.COMMERCIAL,
                SystemRole.ENGINEERING
        )) {
            denied("Tu rol interno no permite preparar órdenes de trabajo.");
        }
        return user;
    }

    public User requireProductionActor(Long userId) {
        User user = requireInternalUser(userId);
        if (!hasAnyRole(userId, SystemRole.ADMIN, SystemRole.PRODUCTION)) {
            denied("Tu rol interno no permite gestionar producción.");
        }
        return user;
    }

    public User requireQualityActor(Long userId) {
        User user = requireInternalUser(userId);
        if (!hasAnyRole(userId, SystemRole.ADMIN, SystemRole.QUALITY)) {
            denied("Tu rol interno no permite gestionar Calidad.");
        }
        return user;
    }

    public User requireAssignedQualityActor(Long userId, Long inspectorUserId) {
        User user = requireInternalUser(userId);

        if (hasAnyRole(userId, SystemRole.ADMIN)) {
            return user;
        }

        if (inspectorUserId == null
                || !userId.equals(inspectorUserId)
                || !hasAnyRole(userId, SystemRole.QUALITY)) {
            denied("Solo el inspector asignado o un ADMIN puede modificar la inspección.");
        }

        return user;
    }

    public void requireInternalReader(Long userId) {
        requireInternalUser(userId);
        if (!hasAnyRole(
                userId,
                SystemRole.ADMIN,
                SystemRole.COMMERCIAL,
                SystemRole.ENGINEERING,
                SystemRole.PRODUCTION,
                SystemRole.QUALITY,
                SystemRole.LOGISTICS,
                SystemRole.AUDITOR
        )) {
            denied("Tu rol interno no permite consultar órdenes de trabajo.");
        }
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
