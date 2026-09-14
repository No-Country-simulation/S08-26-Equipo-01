package com.nocountry.qualitytrack.users.service;

import com.nocountry.qualitytrack.auth.entity.EmailVerificationToken;
import com.nocountry.qualitytrack.auth.repository.EmailVerificationTokenRepository;
import com.nocountry.qualitytrack.auth.token.OpaqueTokenService;
import com.nocountry.qualitytrack.notification.email.EmailService;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.dto.request.CompleteInternalUserInvitationRequest;
import com.nocountry.qualitytrack.users.dto.request.CreateInternalUserInvitationRequest;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationAcceptResponse;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationResponse;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InternalUserInvitationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSystemRoleRepository roleRepository;

    @Mock
    private EmailVerificationTokenRepository tokenRepository;

    @Mock
    private OpaqueTokenService opaqueTokenService;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    private InternalUserInvitationService service;

    @BeforeEach
    void setUp() {
        service = new InternalUserInvitationService(
                userRepository,
                roleRepository,
                tokenRepository,
                opaqueTokenService,
                emailService,
                passwordEncoder,
                Duration.ofHours(72)
        );
    }

    @Test
    void adminCanInviteInternalUserWithMultipleRoles() {
        User admin = activeInternal("Admin", "User", "admin@qualitytrack.local", 1L);
        CreateInternalUserInvitationRequest request = new CreateInternalUserInvitationRequest(
                " Ana ",
                " Torres ",
                " Ana@QualityTrack.Local ",
                Set.of(SystemRole.COMMERCIAL, SystemRole.ENGINEERING)
        );

        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(roleRepository.existsByIdUserIdAndIdRole(1L, SystemRole.ADMIN)).thenReturn(true);
        when(userRepository.findByEmailIgnoreCase("ana@qualitytrack.local")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("temporary-hash");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 2L);
            return saved;
        });
        when(opaqueTokenService.generate())
                .thenReturn(new OpaqueTokenService.GeneratedOpaqueToken("raw-token", "token-hash"));
        when(tokenRepository.findById(2L)).thenReturn(Optional.empty());
        when(tokenRepository.saveAndFlush(any(EmailVerificationToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        InternalUserInvitationResponse response = service.createInvitation(1L, request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        User invited = userCaptor.getValue();

        assertEquals(AccountType.INTERNAL, invited.getAccountType());
        assertEquals(UserStatus.PENDING_ACTIVATION, invited.getStatus());
        assertEquals("ana@qualitytrack.local", invited.getEmail());
        assertEquals(2, response.roles().size());
        assertTrue(response.roles().contains(SystemRole.COMMERCIAL));
        assertTrue(response.roles().contains(SystemRole.ENGINEERING));

        verify(emailService).sendInternalInvitationEmail(
                "ana@qualitytrack.local",
                "raw-token",
                List.of("COMMERCIAL", "ENGINEERING")
        );
    }

    @Test
    void acceptingInvitationActivatesAccountAndConsumesToken() {
        User admin = activeInternal("Admin", "User", "admin@qualitytrack.local", 1L);
        User pending = User.inviteInternal(
                "Ana",
                "Torres",
                "ana@qualitytrack.local",
                "temporary-hash"
        );
        ReflectionTestUtils.setField(pending, "id", 2L);

        EmailVerificationToken token = new EmailVerificationToken(
                pending,
                "token-hash",
                Instant.now().plus(Duration.ofHours(1)),
                Instant.now()
        );

        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");
        when(tokenRepository.findByTokenHashForUpdate("token-hash")).thenReturn(Optional.of(token));
        when(roleRepository.findAllByIdUserId(2L)).thenReturn(List.of(
                new UserSystemRole(pending, SystemRole.COMMERCIAL, admin),
                new UserSystemRole(pending, SystemRole.ENGINEERING, admin)
        ));
        when(passwordEncoder.encode("NewSecurePass123")).thenReturn("new-password-hash");

        InternalUserInvitationAcceptResponse response = service.acceptInvitation(
                new CompleteInternalUserInvitationRequest("raw-token", "NewSecurePass123")
        );

        assertEquals(UserStatus.ACTIVE, pending.getStatus());
        assertEquals("new-password-hash", pending.getPasswordHash());
        assertEquals(UserStatus.ACTIVE, response.status());
        assertEquals(2, response.roles().size());
        verify(tokenRepository).delete(token);
    }

    @Test
    void nonAdminCannotInviteInternalUsers() {
        User customer = User.registerCustomer(
                "Client",
                "User",
                "client@example.com",
                "hash"
        );
        ReflectionTestUtils.setField(customer, "id", 3L);
        customer.verifyEmail(Instant.now());

        when(userRepository.findById(3L)).thenReturn(Optional.of(customer));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.createInvitation(
                        3L,
                        new CreateInternalUserInvitationRequest(
                                "Ana",
                                "Torres",
                                "ana@qualitytrack.local",
                                Set.of(SystemRole.QUALITY)
                        )
                )
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    private User activeInternal(String firstName, String lastName, String email, Long id) {
        User user = User.createActiveInternal(firstName, lastName, email, "hash");
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }
}
