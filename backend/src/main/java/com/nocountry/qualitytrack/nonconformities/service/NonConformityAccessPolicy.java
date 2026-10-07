package com.nocountry.qualitytrack.nonconformities.service;

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
public class NonConformityAccessPolicy {

    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;

    public User requireQualityActor(Long userId) {
        return requireAny(userId, SystemRole.ADMIN, SystemRole.QUALITY);
    }

    public User requireEngineeringActor(Long userId) {
        return requireAny(userId, SystemRole.ADMIN, SystemRole.ENGINEERING);
    }

    public User requireResolutionActor(Long userId) {
        return requireAny(
                userId,
                SystemRole.ADMIN,
                SystemRole.QUALITY,
                SystemRole.ENGINEERING
        );
    }

    public User requireAdminActor(Long userId) {
        return requireAny(userId, SystemRole.ADMIN);
    }

    public void requireInternalReader(Long userId) {
        requireAny(
                userId,
                SystemRole.ADMIN,
                SystemRole.COMMERCIAL,
                SystemRole.ENGINEERING,
                SystemRole.PRODUCTION,
                SystemRole.QUALITY,
                SystemRole.LOGISTICS,
                SystemRole.AUDITOR
        );
    }

    private User requireAny(Long userId, SystemRole... roles) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el usuario autenticado."
                ));

        if (user.getAccountType() != AccountType.INTERNAL) {
            denied("Esta operación está disponible únicamente para usuarios internos autorizados.");
        }

        boolean allowed = userSystemRoleRepository.findAllByIdUserId(userId)
                .stream()
                .map(UserSystemRole::getRole)
                .anyMatch(role -> contains(roles, role));

        if (!allowed) {
            denied("Tu rol interno no permite realizar esta operación sobre la no conformidad.");
        }

        return user;
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
