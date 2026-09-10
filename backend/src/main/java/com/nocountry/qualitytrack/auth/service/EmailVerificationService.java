package com.nocountry.qualitytrack.auth.service;

import com.nocountry.qualitytrack.auth.entity.EmailVerificationToken;
import com.nocountry.qualitytrack.auth.repository.EmailVerificationTokenRepository;
import com.nocountry.qualitytrack.auth.token.OpaqueTokenService;
import com.nocountry.qualitytrack.notification.email.EmailService;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

@Service
public class EmailVerificationService {

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final OpaqueTokenService opaqueTokenService;
    private final EmailService emailService;
    private final TokenCleanupService tokenCleanupService;
    private final Duration expiration;

    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            UserRepository userRepository,
            OpaqueTokenService opaqueTokenService,
            EmailService emailService,
            TokenCleanupService tokenCleanupService,
            @Value("${security.auth.email-verification-expiration:24h}") Duration expiration
    ) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.opaqueTokenService = opaqueTokenService;
        this.emailService = emailService;
        this.tokenCleanupService = tokenCleanupService;
        this.expiration = expiration;
    }

    @Transactional
    public void issueVerification(User user) {
        if (user.getAccountType() != AccountType.CUSTOMER
                || user.getStatus() != UserStatus.PENDING_VERIFICATION) {
            throw new BusinessException(
                    ApiErrorCode.VERIFICATION_NOT_AVAILABLE,
                    "La verificación de correo no está disponible para esta cuenta."
            );
        }

        Instant now = Instant.now();
        OpaqueTokenService.GeneratedOpaqueToken generated = opaqueTokenService.generate();

        EmailVerificationToken token = tokenRepository.findById(user.getId())
                .map(existing -> {
                    existing.rotate(generated.hash(), now.plus(expiration), now);
                    return existing;
                })
                .orElseGet(() -> new EmailVerificationToken(
                        user,
                        generated.hash(),
                        now.plus(expiration),
                        now
                ));

        tokenRepository.save(token);
        emailService.sendVerificationEmail(user.getEmail(), generated.value());
    }

    @Transactional
    public void verify(String rawToken) {
        Instant now = Instant.now();
        String hash = opaqueTokenService.hash(rawToken);

        EmailVerificationToken token = tokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.INVALID_VERIFICATION_TOKEN,
                        "El token de verificación no es válido."
                ));

        if (token.isExpired(now)) {
            tokenCleanupService.deleteEmailVerificationToken(token.getUserId());
            throw new BusinessException(
                    ApiErrorCode.VERIFICATION_TOKEN_EXPIRED,
                    "El token de verificación ha expirado."
            );
        }

        User user = token.getUser();
        if (user.getAccountType() != AccountType.CUSTOMER
                || user.getStatus() != UserStatus.PENDING_VERIFICATION) {
            tokenCleanupService.deleteEmailVerificationToken(token.getUserId());
            throw new BusinessException(
                    ApiErrorCode.VERIFICATION_NOT_AVAILABLE,
                    "La verificación de correo no está disponible para esta cuenta."
            );
        }

        user.verifyEmail(now);
        tokenRepository.delete(token);
    }

    /**
     * Marks a pending customer account as verified when another trusted proof already demonstrated
     * control of the destination email, such as a valid one-time customer invitation token.
     * Any ordinary email-verification token is consumed in the same transaction so no stale
     * verification credential remains after activation.
     */
    @Transactional
    public void verifyWithTrustedEmailProof(User user, Instant verifiedAt) {
        if (user.getAccountType() != AccountType.CUSTOMER
                || user.getStatus() != UserStatus.PENDING_VERIFICATION) {
            throw new BusinessException(
                    ApiErrorCode.VERIFICATION_NOT_AVAILABLE,
                    "La verificación de correo no está disponible para esta cuenta."
            );
        }

        user.verifyEmail(verifiedAt);
        tokenRepository.findById(user.getId()).ifPresent(tokenRepository::delete);
    }

    @Transactional
    public void resend(String email) {
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);

        userRepository.findByEmail(normalizedEmail)
                .filter(user -> user.getAccountType() == AccountType.CUSTOMER)
                .filter(user -> user.getStatus() == UserStatus.PENDING_VERIFICATION)
                .ifPresent(this::issueVerification);
    }
}
