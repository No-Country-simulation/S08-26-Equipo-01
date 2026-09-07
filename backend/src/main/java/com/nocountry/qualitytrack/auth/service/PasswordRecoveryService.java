package com.nocountry.qualitytrack.auth.service;

import com.nocountry.qualitytrack.auth.entity.PasswordResetToken;
import com.nocountry.qualitytrack.auth.repository.PasswordResetTokenRepository;
import com.nocountry.qualitytrack.auth.token.OpaqueTokenService;
import com.nocountry.qualitytrack.notification.email.EmailService;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

@Service
public class PasswordRecoveryService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final OpaqueTokenService opaqueTokenService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TokenCleanupService tokenCleanupService;
    private final Duration expiration;

    public PasswordRecoveryService(
            UserRepository userRepository,
            PasswordResetTokenRepository tokenRepository,
            OpaqueTokenService opaqueTokenService,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            TokenCleanupService tokenCleanupService,
            @Value("${security.auth.password-reset-expiration:30m}") Duration expiration
    ) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.opaqueTokenService = opaqueTokenService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.tokenCleanupService = tokenCleanupService;
        this.expiration = expiration;
    }

    @Transactional
    public void requestReset(String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        userRepository.findByEmail(normalizedEmail)
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .ifPresent(this::issueResetToken);
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        Instant now = Instant.now();
        String hash = opaqueTokenService.hash(rawToken);

        PasswordResetToken token = tokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.INVALID_PASSWORD_RESET_TOKEN,
                        "El token para restablecer la contraseña no es válido."
                ));

        if (token.isExpired(now)) {
            tokenCleanupService.deletePasswordResetToken(token.getUserId());
            throw new BusinessException(
                    ApiErrorCode.PASSWORD_RESET_TOKEN_EXPIRED,
                    "El token para restablecer la contraseña ha expirado."
            );
        }

        User user = token.getUser();
        if (user.getStatus() != UserStatus.ACTIVE) {
            tokenCleanupService.deletePasswordResetToken(token.getUserId());
            throw new BusinessException(
                    ApiErrorCode.INVALID_PASSWORD_RESET_TOKEN,
                    "El token para restablecer la contraseña no es válido."
            );
        }

        user.changePassword(passwordEncoder.encode(newPassword));
        tokenRepository.delete(token);
    }

    private void issueResetToken(User user) {
        Instant now = Instant.now();
        OpaqueTokenService.GeneratedOpaqueToken generated = opaqueTokenService.generate();

        PasswordResetToken token = tokenRepository.findById(user.getId())
                .map(existing -> {
                    existing.rotate(generated.hash(), now.plus(expiration), now);
                    return existing;
                })
                .orElseGet(() -> new PasswordResetToken(
                        user,
                        generated.hash(),
                        now.plus(expiration),
                        now
                ));

        tokenRepository.save(token);
        emailService.sendPasswordResetEmail(user.getEmail(), generated.value());
    }
}
