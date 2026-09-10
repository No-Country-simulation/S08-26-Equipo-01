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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmailVerificationServiceTest {

    @Mock
    private EmailVerificationTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private TokenCleanupService tokenCleanupService;

    @Mock
    private User trustedUser;

    @Mock
    private EmailVerificationToken existingToken;

    private OpaqueTokenService opaqueTokenService;
    private EmailVerificationService service;

    @BeforeEach
    void setUp() {
        opaqueTokenService = new OpaqueTokenService();
        service = new EmailVerificationService(
                tokenRepository,
                userRepository,
                opaqueTokenService,
                emailService,
                tokenCleanupService,
                Duration.ofHours(24)
        );
    }

    @Test
    void verifiesValidTokenAndConsumesIt() {
        String rawToken = "valid-verification-token";
        User user = User.registerCustomer("Edgar", "Camberos", "edgar@example.com", "hash");
        Instant now = Instant.now();
        EmailVerificationToken token = new EmailVerificationToken(
                user,
                opaqueTokenService.hash(rawToken),
                now.plusSeconds(3600),
                now.minusSeconds(60)
        );

        when(tokenRepository.findByTokenHash(opaqueTokenService.hash(rawToken)))
                .thenReturn(Optional.of(token));

        service.verify(rawToken);

        assertEquals(UserStatus.ACTIVE, user.getStatus());
        assertNotNull(user.getEmailVerifiedAt());
        verify(tokenRepository).delete(token);
    }

    @Test
    void trustedEmailProofVerifiesPendingCustomerAndConsumesOrdinaryToken() {
        Instant verifiedAt = Instant.now();
        when(trustedUser.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(trustedUser.getStatus()).thenReturn(UserStatus.PENDING_VERIFICATION);
        when(trustedUser.getId()).thenReturn(10L);
        when(tokenRepository.findById(10L)).thenReturn(Optional.of(existingToken));

        service.verifyWithTrustedEmailProof(trustedUser, verifiedAt);

        verify(trustedUser).verifyEmail(verifiedAt);
        verify(tokenRepository).delete(existingToken);
    }

    @Test
    void rejectsExpiredTokenAndCleansItInIndependentTransaction() {
        String rawToken = "expired-verification-token";
        User user = User.registerCustomer("Edgar", "Camberos", "edgar@example.com", "hash");
        Instant now = Instant.now();
        EmailVerificationToken token = new EmailVerificationToken(
                user,
                opaqueTokenService.hash(rawToken),
                now.minusSeconds(1),
                now.minusSeconds(3600)
        );

        when(tokenRepository.findByTokenHash(opaqueTokenService.hash(rawToken)))
                .thenReturn(Optional.of(token));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.verify(rawToken)
        );

        assertEquals(ApiErrorCode.VERIFICATION_TOKEN_EXPIRED, exception.getCode());
        verify(tokenCleanupService).deleteEmailVerificationToken(token.getUserId());
    }
}
