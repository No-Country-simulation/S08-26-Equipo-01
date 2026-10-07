package com.nocountry.qualitytrack.auth.service;

import com.nocountry.qualitytrack.auth.entity.PasswordResetToken;
import com.nocountry.qualitytrack.auth.repository.PasswordResetTokenRepository;
import com.nocountry.qualitytrack.auth.token.OpaqueTokenService;
import com.nocountry.qualitytrack.notification.email.EmailService;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordRecoveryServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordResetTokenRepository tokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;
    @Mock private TokenCleanupService tokenCleanupService;

    private OpaqueTokenService opaqueTokenService;
    private PasswordRecoveryService service;

    @BeforeEach
    void setUp() {
        opaqueTokenService = new OpaqueTokenService();
        service = new PasswordRecoveryService(
                userRepository,
                tokenRepository,
                opaqueTokenService,
                passwordEncoder,
                emailService,
                tokenCleanupService,
                Duration.ofMinutes(30)
        );
    }

    @Test
    void createsResetTokenForActiveAccountWithoutExposingItInDatabase() {
        User user = activeUser();
        when(userRepository.findByEmail("edgar@example.com")).thenReturn(Optional.of(user));

        service.requestReset(" Edgar@Example.COM ");

        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    void resetsPasswordAndConsumesToken() {
        String rawToken = "valid-reset-token";
        User user = activeUser();
        Instant now = Instant.now();
        PasswordResetToken token = new PasswordResetToken(
                user,
                opaqueTokenService.hash(rawToken),
                now.plusSeconds(600),
                now.minusSeconds(60)
        );

        when(tokenRepository.findByTokenHash(opaqueTokenService.hash(rawToken))).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("updated-password")).thenReturn("new-hash");

        service.resetPassword(rawToken, "updated-password");

        assertEquals("new-hash", user.getPasswordHash());
        verify(tokenRepository).delete(token);
    }

    @Test
    void rejectsExpiredTokenAndCleansItInIndependentTransaction() {
        String rawToken = "expired-reset-token";
        User user = activeUser();
        Instant now = Instant.now();
        PasswordResetToken token = new PasswordResetToken(
                user,
                opaqueTokenService.hash(rawToken),
                now.minusSeconds(1),
                now.minusSeconds(600)
        );

        when(tokenRepository.findByTokenHash(opaqueTokenService.hash(rawToken))).thenReturn(Optional.of(token));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.resetPassword(rawToken, "updated-password")
        );

        assertEquals(ApiErrorCode.PASSWORD_RESET_TOKEN_EXPIRED, exception.getCode());
        verify(tokenCleanupService).deletePasswordResetToken(token.getUserId());
    }

    private User activeUser() {
        User user = User.registerCustomer("Edgar", "Camberos", "edgar@example.com", "old-hash");
        user.verifyEmail(Instant.now());
        return user;
    }
}
