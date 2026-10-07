package com.nocountry.qualitytrack.users.service;

import com.nocountry.qualitytrack.auth.service.TokenCleanupService;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.dto.request.ChangeOwnPasswordRequest;
import com.nocountry.qualitytrack.users.dto.request.UpdateOwnProfileRequest;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.util.PersonNameNormalizer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OwnAccountService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenCleanupService tokenCleanupService;
    private final DemoAccountPolicy demoAccountPolicy;

    @Transactional(readOnly = true)
    public User getActiveUser(Long currentUserId, AccountType accountType) {
        User user = userRepository.findByIdAndAccountType(currentUserId, accountType)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la cuenta autenticada."
                ));
        requireActive(user);
        return user;
    }

    @Transactional
    public User updateProfile(
            Long currentUserId,
            AccountType accountType,
            UpdateOwnProfileRequest request
    ) {
        demoAccountPolicy.requireIdentityMutationAllowed(currentUserId);
        User user = requireUserForUpdate(currentUserId, accountType);
        requireActive(user);

        String firstName = PersonNameNormalizer.normalize(request.firstName());
        String lastName = PersonNameNormalizer.normalize(request.lastName());

        if (!firstName.equals(user.getFirstName()) || !lastName.equals(user.getLastName())) {
            user.updateProfile(firstName, lastName);
            userRepository.saveAndFlush(user);
        }

        return user;
    }

    @Transactional
    public void changePassword(
            Long currentUserId,
            AccountType accountType,
            ChangeOwnPasswordRequest request
    ) {
        demoAccountPolicy.requireIdentityMutationAllowed(currentUserId);
        User user = requireUserForUpdate(currentUserId, accountType);
        requireActive(user);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BusinessException(
                    ApiErrorCode.INVALID_CREDENTIALS,
                    "La contraseña actual no es correcta."
            );
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "La nueva contraseña debe ser diferente a la actual."
            );
        }

        user.changePassword(passwordEncoder.encode(request.newPassword()));
        userRepository.saveAndFlush(user);
        tokenCleanupService.deletePasswordResetToken(user.getId());
    }

    private User requireUserForUpdate(Long userId, AccountType accountType) {
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la cuenta autenticada."
                ));

        if (user.getAccountType() != accountType) {
            throw new BusinessException(
                    ApiErrorCode.RESOURCE_NOT_FOUND,
                    "No se encontró la cuenta autenticada."
            );
        }

        return user;
    }

    private void requireActive(User user) {
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo una cuenta activa puede consultar o actualizar su perfil."
            );
        }
    }
}
