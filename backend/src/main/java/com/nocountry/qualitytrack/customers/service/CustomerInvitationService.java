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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class CustomerInvitationService {

    private final CustomerRepository customerRepository;
    private final CustomerMembershipRepository membershipRepository;
    private final CustomerInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final EmailVerificationService emailVerificationService;
    private final OpaqueTokenService opaqueTokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final Duration invitationExpiration;

    public CustomerInvitationService(
            CustomerRepository customerRepository,
            CustomerMembershipRepository membershipRepository,
            CustomerInvitationRepository invitationRepository,
            UserRepository userRepository,
            EmailVerificationService emailVerificationService,
            OpaqueTokenService opaqueTokenService,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            @Value("${app.customer-invitations.expiration:PT72H}") Duration invitationExpiration
    ) {
        if (invitationExpiration == null || invitationExpiration.isZero() || invitationExpiration.isNegative()) {
            throw new IllegalStateException("La expiración de las invitaciones debe ser mayor a cero.");
        }

        this.customerRepository = customerRepository;
        this.membershipRepository = membershipRepository;
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.emailVerificationService = emailVerificationService;
        this.opaqueTokenService = opaqueTokenService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.invitationExpiration = invitationExpiration;
    }

    @Transactional
    public CustomerInvitationResponse createInvitation(
            Long currentUserId,
            Long customerId,
            CreateCustomerInvitationRequest request
    ) {
        Customer customer = customerRepository.findByIdForUpdate(customerId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la empresa."
                ));

        CustomerMembership inviterMembership = requireActiveAdmin(currentUserId, customerId);
        User inviter = inviterMembership.getUser();
        String email = normalizeEmail(request.email());
        Instant now = Instant.now();

        validateTargetCanBeInvited(customerId, email);
        expirePreviousInvitationIfNecessary(customerId, email, now);

        OpaqueTokenService.GeneratedOpaqueToken token = opaqueTokenService.generate();
        CustomerInvitation invitation = CustomerInvitation.create(
                customer,
                email,
                request.role(),
                token.hash(),
                now.plus(invitationExpiration),
                inviter
        );

        invitation = invitationRepository.saveAndFlush(invitation);
        emailService.sendCustomerInvitationEmail(
                email,
                token.value(),
                customer.getName(),
                request.role().name()
        );

        return CustomerInvitationResponse.from(invitation);
    }

    @Transactional(readOnly = true)
    public List<CustomerInvitationResponse> listPendingInvitations(Long currentUserId, Long customerId) {
        requireActiveAdmin(currentUserId, customerId);

        return invitationRepository
                .findAllByCustomer_IdAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(
                        customerId,
                        CustomerInvitationStatus.PENDING,
                        Instant.now()
                )
                .stream()
                .map(CustomerInvitationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerInvitationPreviewResponse resolveInvitation(CustomerInvitationTokenRequest request) {
        CustomerInvitation invitation = requireAvailableInvitation(request.token());
        return CustomerInvitationPreviewResponse.from(invitation);
    }

    @Transactional
    public CustomerInvitationAcceptResponse acceptInvitation(CustomerInvitationTokenRequest request) {
        CustomerInvitation invitation = requireAvailableInvitationForUpdate(request.token());
        Optional<User> existingUser = userRepository.findByEmail(invitation.getEmail());

        if (existingUser.isEmpty()) {
            return CustomerInvitationAcceptResponse.registrationRequired(invitation);
        }

        User user = existingUser.get();
        validateExistingAccountForAcceptance(user);

        Instant acceptedAt = Instant.now();
        if (user.getStatus() == UserStatus.PENDING_VERIFICATION) {
            // The invitation token is a trusted proof of control of the invited email address.
            // Consume any ordinary verification token in the same transaction as acceptance.
            emailVerificationService.verifyWithTrustedEmailProof(user, acceptedAt);
        }

        activateMembership(invitation, user, acceptedAt);
        invitation.accept(user, acceptedAt);
        invitationRepository.save(invitation);

        return CustomerInvitationAcceptResponse.accepted(invitation);
    }

    @Transactional
    public CustomerInvitationAcceptResponse completeRegistration(
            CompleteCustomerInvitationRegistrationRequest request
    ) {
        CustomerInvitation invitation = requireAvailableInvitationForUpdate(request.token());
        String email = invitation.getEmail();

        if (userRepository.existsByEmail(email)) {
            throw existingAccountForInvitation();
        }

        Instant acceptedAt = Instant.now();
        User user = User.registerCustomer(
                request.firstName().trim(),
                request.lastName().trim(),
                email,
                passwordEncoder.encode(request.password())
        );

        // The invitation itself verifies control of the destination email address.
        user.verifyEmail(acceptedAt);

        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException exception) {
            // Covers a concurrent normal registration using the same invited email.
            throw existingAccountForInvitation();
        }

        CustomerMembership membership = CustomerMembership.acceptedInvitation(
                invitation.getCustomer(),
                user,
                invitation.getRole(),
                invitation.getInvitedByUser(),
                acceptedAt
        );
        membershipRepository.save(membership);

        invitation.accept(user, acceptedAt);
        invitationRepository.save(invitation);

        return CustomerInvitationAcceptResponse.accepted(invitation);
    }

    private CustomerInvitation requireAvailableInvitation(String rawToken) {
        String tokenHash = opaqueTokenService.hash(rawToken.trim());
        CustomerInvitation invitation = invitationRepository.findByTokenHash(tokenHash)
                .orElseThrow(this::invalidInvitation);

        validateInvitationIsAvailable(invitation);
        return invitation;
    }

    private CustomerInvitation requireAvailableInvitationForUpdate(String rawToken) {
        String tokenHash = opaqueTokenService.hash(rawToken.trim());
        CustomerInvitation invitation = invitationRepository.findByTokenHashForUpdate(tokenHash)
                .orElseThrow(this::invalidInvitation);

        validateInvitationIsAvailable(invitation);
        return invitation;
    }

    private void validateInvitationIsAvailable(CustomerInvitation invitation) {
        if (invitation.getStatus() == CustomerInvitationStatus.EXPIRED) {
            throw expiredInvitation();
        }

        if (invitation.getStatus() != CustomerInvitationStatus.PENDING) {
            throw new BusinessException(
                    ApiErrorCode.INVALID_CUSTOMER_INVITATION_TOKEN,
                    "La invitación ya no está disponible."
            );
        }

        if (invitation.isExpired(Instant.now())) {
            throw expiredInvitation();
        }
    }

    private void validateTargetCanBeInvited(Long customerId, String email) {
        Optional<User> targetUser = userRepository.findByEmail(email);
        if (targetUser.isEmpty()) {
            return;
        }

        User user = targetUser.get();
        if (user.getAccountType() != AccountType.CUSTOMER) {
            throw unavailableAccountForInvitation();
        }

        if (user.getStatus() == UserStatus.SUSPENDED || user.getStatus() == UserStatus.PENDING_ACTIVATION) {
            throw unavailableAccountForInvitation();
        }

        membershipRepository.findByCustomer_IdAndUser_Id(customerId, user.getId())
                .filter(membership -> membership.getStatus() == CustomerMembershipStatus.ACTIVE)
                .ifPresent(membership -> {
                    throw new BusinessException(
                            ApiErrorCode.DATA_CONFLICT,
                            "El usuario ya es miembro activo de la empresa."
                    );
                });
    }

    private void validateExistingAccountForAcceptance(User user) {
        if (user.getAccountType() != AccountType.CUSTOMER) {
            throw unavailableAccountForInvitation();
        }

        if (user.getStatus() != UserStatus.ACTIVE && user.getStatus() != UserStatus.PENDING_VERIFICATION) {
            throw unavailableAccountForInvitation();
        }
    }

    private void expirePreviousInvitationIfNecessary(Long customerId, String email, Instant now) {
        Optional<CustomerInvitation> pending = invitationRepository.findByCustomer_IdAndEmailAndStatus(
                customerId,
                email,
                CustomerInvitationStatus.PENDING
        );

        if (pending.isEmpty()) {
            return;
        }

        CustomerInvitation existing = pending.get();
        if (!existing.isExpired(now)) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "Ya existe una invitación pendiente para ese correo en esta empresa."
            );
        }

        existing.markExpired();
        invitationRepository.saveAndFlush(existing);
    }

    private CustomerMembership activateMembership(
            CustomerInvitation invitation,
            User user,
            Instant acceptedAt
    ) {
        Optional<CustomerMembership> existing = membershipRepository.findByCustomer_IdAndUser_Id(
                invitation.getCustomer().getId(),
                user.getId()
        );

        if (existing.isPresent()) {
            CustomerMembership membership = existing.get();
            if (membership.getStatus() == CustomerMembershipStatus.ACTIVE) {
                throw new BusinessException(
                        ApiErrorCode.DATA_CONFLICT,
                        "El usuario ya es miembro activo de la empresa."
                );
            }

            membership.activateFromInvitation(
                    invitation.getRole(),
                    invitation.getInvitedByUser(),
                    acceptedAt
            );
            return membershipRepository.save(membership);
        }

        CustomerMembership membership = CustomerMembership.acceptedInvitation(
                invitation.getCustomer(),
                user,
                invitation.getRole(),
                invitation.getInvitedByUser(),
                acceptedAt
        );
        return membershipRepository.save(membership);
    }

    private CustomerMembership requireActiveAdmin(Long userId, Long customerId) {
        CustomerMembership membership = membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                        customerId,
                        userId,
                        CustomerMembershipStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "No tienes acceso a esta empresa."
                ));

        if (membership.getRole() != CustomerMembershipRole.ADMIN) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo un administrador de la empresa puede gestionar invitaciones."
            );
        }

        return membership;
    }

    private BusinessException invalidInvitation() {
        return new BusinessException(
                ApiErrorCode.INVALID_CUSTOMER_INVITATION_TOKEN,
                "La invitación no es válida."
        );
    }

    private BusinessException expiredInvitation() {
        return new BusinessException(
                ApiErrorCode.CUSTOMER_INVITATION_EXPIRED,
                "La invitación ha expirado."
        );
    }

    private BusinessException existingAccountForInvitation() {
        return new BusinessException(
                ApiErrorCode.DATA_CONFLICT,
                "Ya existe una cuenta asociada a este correo. Vuelve a aceptar la invitación para continuar con esa cuenta."
        );
    }

    private BusinessException unavailableAccountForInvitation() {
        return new BusinessException(
                ApiErrorCode.DATA_CONFLICT,
                "La cuenta asociada a la invitación no está disponible para incorporarse a esta empresa."
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
