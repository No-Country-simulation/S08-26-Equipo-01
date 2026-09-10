package com.nocountry.qualitytrack.customers.service;

import com.nocountry.qualitytrack.auth.service.EmailVerificationService;
import com.nocountry.qualitytrack.auth.token.OpaqueTokenService;
import com.nocountry.qualitytrack.customers.dto.request.CompleteCustomerInvitationRegistrationRequest;
import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerInvitationRequest;
import com.nocountry.qualitytrack.customers.dto.request.CustomerInvitationTokenRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerInvitationAcceptResponse;
import com.nocountry.qualitytrack.customers.dto.response.CustomerInvitationPreviewResponse;
import com.nocountry.qualitytrack.customers.dto.response.CustomerInvitationResponse;
import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerInvitation;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerInvitationAcceptOutcome;
import com.nocountry.qualitytrack.customers.enums.CustomerInvitationStatus;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerInvitationRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
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
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerInvitationServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMembershipRepository membershipRepository;

    @Mock
    private CustomerInvitationRepository invitationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailVerificationService emailVerificationService;

    @Mock
    private OpaqueTokenService opaqueTokenService;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private Customer customer;

    @Mock
    private User inviter;

    @Mock
    private User invitedUser;

    @Mock
    private CustomerMembership adminMembership;

    private CustomerInvitationService service;

    @BeforeEach
    void setUp() {
        service = new CustomerInvitationService(
                customerRepository,
                membershipRepository,
                invitationRepository,
                userRepository,
                emailVerificationService,
                opaqueTokenService,
                emailService,
                passwordEncoder,
                Duration.ofHours(72)
        );
    }

    @Test
    void createsInvitationOnlyAfterAdminAuthorization() {
        CreateCustomerInvitationRequest request = new CreateCustomerInvitationRequest(
                " MEMBER@Example.com ",
                CustomerMembershipRole.REQUESTER
        );

        when(customerRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(customer));
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(adminMembership));
        when(adminMembership.getRole()).thenReturn(CustomerMembershipRole.ADMIN);
        when(adminMembership.getUser()).thenReturn(inviter);
        when(customer.getName()).thenReturn("Taller Norte");
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.empty());
        when(invitationRepository.findByCustomer_IdAndEmailAndStatus(
                20L,
                "member@example.com",
                CustomerInvitationStatus.PENDING
        )).thenReturn(Optional.empty());
        when(opaqueTokenService.generate()).thenReturn(
                new OpaqueTokenService.GeneratedOpaqueToken("raw-token", "token-hash")
        );
        when(invitationRepository.saveAndFlush(any(CustomerInvitation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CustomerInvitationResponse response = service.createInvitation(10L, 20L, request);

        assertEquals("member@example.com", response.email());
        assertEquals(CustomerMembershipRole.REQUESTER, response.role());
        assertEquals(CustomerInvitationStatus.PENDING, response.status());
        assertNotNull(response.expiresAt());

        ArgumentCaptor<CustomerInvitation> invitationCaptor = ArgumentCaptor.forClass(CustomerInvitation.class);
        verify(invitationRepository).saveAndFlush(invitationCaptor.capture());
        assertEquals("token-hash", invitationCaptor.getValue().getTokenHash());
        assertEquals(inviter, invitationCaptor.getValue().getInvitedByUser());

        verify(emailService).sendCustomerInvitationEmail(
                "member@example.com",
                "raw-token",
                "Taller Norte",
                "REQUESTER"
        );
    }

    @Test
    void rejectsInvitationFromNonAdminMember() {
        CreateCustomerInvitationRequest request = new CreateCustomerInvitationRequest(
                "member@example.com",
                CustomerMembershipRole.VIEWER
        );

        when(customerRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(customer));
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(adminMembership));
        when(adminMembership.getRole()).thenReturn(CustomerMembershipRole.REQUESTER);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.createInvitation(10L, 20L, request)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(opaqueTokenService, never()).generate();
        verify(emailService, never()).sendCustomerInvitationEmail(any(), any(), any(), any());
    }

    @Test
    void listsOnlyCurrentPendingInvitationsForAdmin() {
        Instant expiresAt = Instant.now().plus(Duration.ofHours(1));
        CustomerInvitation invitation = invitation(expiresAt, CustomerMembershipRole.REQUESTER);
        when(customer.getId()).thenReturn(20L);
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(adminMembership));
        when(adminMembership.getRole()).thenReturn(CustomerMembershipRole.ADMIN);
        when(invitationRepository.findAllByCustomer_IdAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(
                eq(20L),
                eq(CustomerInvitationStatus.PENDING),
                any(Instant.class)
        )).thenReturn(List.of(invitation));

        List<CustomerInvitationResponse> response = service.listPendingInvitations(10L, 20L);

        assertEquals(1, response.size());
        assertEquals(20L, response.get(0).customerId());
        assertEquals("member@example.com", response.get(0).email());
        assertEquals(CustomerInvitationStatus.PENDING, response.get(0).status());
    }

    @Test
    void rejectsPendingInvitationListForNonAdminMember() {
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(adminMembership));
        when(adminMembership.getRole()).thenReturn(CustomerMembershipRole.VIEWER);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.listPendingInvitations(10L, 20L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(invitationRepository, never())
                .findAllByCustomer_IdAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(
                        any(), any(), any()
                );
    }

    @Test
    void resolvesInvitationWithoutConsumingItOrLookingUpAccount() {
        Instant expiresAt = Instant.now().plus(Duration.ofHours(1));
        CustomerInvitation invitation = invitation(expiresAt, CustomerMembershipRole.REQUESTER);
        when(customer.getName()).thenReturn("Taller Norte");
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");
        when(invitationRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(invitation));

        CustomerInvitationPreviewResponse response = service.resolveInvitation(
                new CustomerInvitationTokenRequest(" raw-token ")
        );

        assertEquals("Taller Norte", response.customerName());
        assertEquals(CustomerMembershipRole.REQUESTER, response.role());
        assertEquals(expiresAt, response.expiresAt());
        assertEquals(CustomerInvitationStatus.PENDING, invitation.getStatus());
        assertNull(invitation.getAcceptedByUser());
        verify(userRepository, never()).findByEmail(any());
        verify(invitationRepository, never()).save(any(CustomerInvitation.class));
    }

    @Test
    void acceptsImmediatelyWhenInvitedAccountAlreadyExists() {
        CustomerInvitation invitation = invitation(
                Instant.now().plus(Duration.ofHours(1)),
                CustomerMembershipRole.REQUESTER
        );
        stubExistingActiveCustomerAccount(invitation);
        when(membershipRepository.findByCustomer_IdAndUser_Id(20L, 30L)).thenReturn(Optional.empty());
        when(membershipRepository.save(any(CustomerMembership.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CustomerInvitationAcceptResponse response = service.acceptInvitation(
                new CustomerInvitationTokenRequest(" raw-token ")
        );

        assertEquals(CustomerInvitationAcceptOutcome.ACCEPTED, response.outcome());
        assertEquals("Taller Norte", response.customerName());
        assertEquals(CustomerMembershipRole.REQUESTER, response.role());
        assertEquals(CustomerInvitationStatus.ACCEPTED, invitation.getStatus());
        assertEquals(invitedUser, invitation.getAcceptedByUser());
        assertNotNull(invitation.getAcceptedAt());
        verify(invitationRepository).save(invitation);
    }

    @Test
    void leavesInvitationPendingWhenRegistrationIsRequired() {
        CustomerInvitation invitation = invitation(
                Instant.now().plus(Duration.ofHours(1)),
                CustomerMembershipRole.VIEWER
        );
        when(customer.getName()).thenReturn("Taller Norte");
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");
        when(invitationRepository.findByTokenHashForUpdate("token-hash")).thenReturn(Optional.of(invitation));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.empty());

        CustomerInvitationAcceptResponse response = service.acceptInvitation(
                new CustomerInvitationTokenRequest("raw-token")
        );

        assertEquals(CustomerInvitationAcceptOutcome.REGISTRATION_REQUIRED, response.outcome());
        assertEquals(CustomerInvitationStatus.PENDING, invitation.getStatus());
        assertNull(invitation.getAcceptedByUser());
        assertNull(invitation.getAcceptedAt());
        verify(membershipRepository, never()).save(any(CustomerMembership.class));
        verify(invitationRepository, never()).save(any(CustomerInvitation.class));
    }

    @Test
    void invitationAlsoVerifiesPendingExistingCustomerAccount() {
        CustomerInvitation invitation = invitation(
                Instant.now().plus(Duration.ofHours(1)),
                CustomerMembershipRole.VIEWER
        );
        when(customer.getId()).thenReturn(20L);
        when(customer.getName()).thenReturn("Taller Norte");
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");
        when(invitationRepository.findByTokenHashForUpdate("token-hash")).thenReturn(Optional.of(invitation));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(invitedUser));
        when(invitedUser.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(invitedUser.getStatus()).thenReturn(UserStatus.PENDING_VERIFICATION);
        when(invitedUser.getId()).thenReturn(30L);
        when(membershipRepository.findByCustomer_IdAndUser_Id(20L, 30L)).thenReturn(Optional.empty());
        when(membershipRepository.save(any(CustomerMembership.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.acceptInvitation(new CustomerInvitationTokenRequest("raw-token"));

        verify(emailVerificationService).verifyWithTrustedEmailProof(eq(invitedUser), any(Instant.class));
        assertEquals(CustomerInvitationStatus.ACCEPTED, invitation.getStatus());
    }

    @Test
    void rejectsAcceptanceForUnavailableExistingAccount() {
        CustomerInvitation invitation = invitation(
                Instant.now().plus(Duration.ofHours(1)),
                CustomerMembershipRole.VIEWER
        );
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");
        when(invitationRepository.findByTokenHashForUpdate("token-hash")).thenReturn(Optional.of(invitation));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(invitedUser));
        when(invitedUser.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(invitedUser.getStatus()).thenReturn(UserStatus.SUSPENDED);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.acceptInvitation(new CustomerInvitationTokenRequest("raw-token"))
        );

        assertEquals(ApiErrorCode.DATA_CONFLICT, exception.getCode());
        assertEquals(CustomerInvitationStatus.PENDING, invitation.getStatus());
        verify(membershipRepository, never()).save(any(CustomerMembership.class));
    }

    @Test
    void completesRegistrationAndConsumesInvitationForNewUser() {
        CustomerInvitation invitation = invitation(
                Instant.now().plus(Duration.ofHours(1)),
                CustomerMembershipRole.REQUESTER
        );
        when(customer.getName()).thenReturn("Taller Norte");
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");
        when(invitationRepository.findByTokenHashForUpdate("token-hash")).thenReturn(Optional.of(invitation));
        when(userRepository.existsByEmail("member@example.com")).thenReturn(false);
        when(passwordEncoder.encode("StrongPass123")).thenReturn("encoded-password");
        when(userRepository.saveAndFlush(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(membershipRepository.save(any(CustomerMembership.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        CustomerInvitationAcceptResponse response = service.completeRegistration(
                new CompleteCustomerInvitationRegistrationRequest(
                        " raw-token ",
                        " Juan ",
                        " Pérez ",
                        "StrongPass123"
                )
        );

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        User createdUser = userCaptor.getValue();

        assertEquals("Juan", createdUser.getFirstName());
        assertEquals("Pérez", createdUser.getLastName());
        assertEquals("member@example.com", createdUser.getEmail());
        assertEquals("encoded-password", createdUser.getPasswordHash());
        assertEquals(AccountType.CUSTOMER, createdUser.getAccountType());
        assertEquals(UserStatus.ACTIVE, createdUser.getStatus());
        assertNotNull(createdUser.getEmailVerifiedAt());
        assertEquals(CustomerInvitationAcceptOutcome.ACCEPTED, response.outcome());
        assertEquals(CustomerInvitationStatus.ACCEPTED, invitation.getStatus());
        assertEquals(createdUser, invitation.getAcceptedByUser());
    }

    @Test
    void rejectsRegistrationCompletionWhenAccountAppearsBeforeFinalization() {
        CustomerInvitation invitation = invitation(
                Instant.now().plus(Duration.ofHours(1)),
                CustomerMembershipRole.VIEWER
        );
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");
        when(invitationRepository.findByTokenHashForUpdate("token-hash")).thenReturn(Optional.of(invitation));
        when(userRepository.existsByEmail("member@example.com")).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.completeRegistration(
                        new CompleteCustomerInvitationRegistrationRequest(
                                "raw-token",
                                "Juan",
                                "Pérez",
                                "StrongPass123"
                        )
                )
        );

        assertEquals(ApiErrorCode.DATA_CONFLICT, exception.getCode());
        assertEquals(CustomerInvitationStatus.PENDING, invitation.getStatus());
        verify(passwordEncoder, never()).encode(any());
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }

    @Test
    void rejectsExpiredInvitationBeforePreviewOrAcceptance() {
        CustomerInvitation invitation = invitation(
                Instant.now().minusSeconds(1),
                CustomerMembershipRole.VIEWER
        );
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");
        when(invitationRepository.findByTokenHash("token-hash")).thenReturn(Optional.of(invitation));

        BusinessException previewException = assertThrows(
                BusinessException.class,
                () -> service.resolveInvitation(new CustomerInvitationTokenRequest("raw-token"))
        );

        assertEquals(ApiErrorCode.CUSTOMER_INVITATION_EXPIRED, previewException.getCode());
        verify(userRepository, never()).findByEmail(any());
    }

    @Test
    void reactivatesRemovedMembershipWhenExistingUserAccepts() {
        CustomerInvitation invitation = invitation(
                Instant.now().plus(Duration.ofHours(1)),
                CustomerMembershipRole.ADMIN
        );
        stubExistingActiveCustomerAccount(invitation);

        CustomerMembership membership = CustomerMembership.acceptedInvitation(
                customer,
                invitedUser,
                CustomerMembershipRole.VIEWER,
                inviter,
                Instant.now().minus(Duration.ofDays(10))
        );
        membership.remove(inviter, Instant.now().minus(Duration.ofDays(2)));

        when(membershipRepository.findByCustomer_IdAndUser_Id(20L, 30L))
                .thenReturn(Optional.of(membership));
        when(membershipRepository.save(membership)).thenReturn(membership);

        service.acceptInvitation(new CustomerInvitationTokenRequest("raw-token"));

        assertEquals(CustomerMembershipStatus.ACTIVE, membership.getStatus());
        assertEquals(CustomerMembershipRole.ADMIN, membership.getRole());
        assertNull(membership.getRemovedByUser());
        assertNull(membership.getRemovedAt());
        assertNotNull(membership.getJoinedAt());
    }

    @Test
    void acceptedInvitationCannotBeConsumedTwice() {
        CustomerInvitation invitation = invitation(
                Instant.now().plus(Duration.ofHours(1)),
                CustomerMembershipRole.REQUESTER
        );
        stubExistingActiveCustomerAccount(invitation);
        when(membershipRepository.findByCustomer_IdAndUser_Id(20L, 30L)).thenReturn(Optional.empty());
        when(membershipRepository.save(any(CustomerMembership.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.acceptInvitation(new CustomerInvitationTokenRequest("raw-token"));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.acceptInvitation(new CustomerInvitationTokenRequest("raw-token"))
        );

        assertEquals(ApiErrorCode.INVALID_CUSTOMER_INVITATION_TOKEN, exception.getCode());
    }

    private CustomerInvitation invitation(Instant expiresAt, CustomerMembershipRole role) {
        return CustomerInvitation.create(
                customer,
                "member@example.com",
                role,
                "token-hash",
                expiresAt,
                inviter
        );
    }

    private void stubExistingActiveCustomerAccount(CustomerInvitation invitation) {
        when(customer.getId()).thenReturn(20L);
        when(customer.getName()).thenReturn("Taller Norte");
        when(opaqueTokenService.hash("raw-token")).thenReturn("token-hash");
        when(invitationRepository.findByTokenHashForUpdate("token-hash")).thenReturn(Optional.of(invitation));
        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(invitedUser));
        when(invitedUser.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(invitedUser.getStatus()).thenReturn(UserStatus.ACTIVE);
        when(invitedUser.getId()).thenReturn(30L);
    }
}
