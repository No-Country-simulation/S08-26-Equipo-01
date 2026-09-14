package com.nocountry.qualitytrack.users.service;

import com.nocountry.qualitytrack.auth.entity.EmailVerificationToken;
import com.nocountry.qualitytrack.auth.repository.EmailVerificationTokenRepository;
import com.nocountry.qualitytrack.auth.token.OpaqueTokenService;
import com.nocountry.qualitytrack.notification.email.EmailService;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.dto.request.CompleteInternalUserInvitationRequest;
import com.nocountry.qualitytrack.users.dto.request.CreateInternalUserInvitationRequest;
import com.nocountry.qualitytrack.users.dto.request.InternalUserInvitationTokenRequest;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationAcceptResponse;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationPreviewResponse;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationResponse;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class InternalUserInvitationService {

    private final UserRepository userRepository;
    private final UserSystemRoleRepository roleRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final OpaqueTokenService opaqueTokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final Duration invitationExpiration;

    public InternalUserInvitationService(
            UserRepository userRepository,
            UserSystemRoleRepository roleRepository,
            EmailVerificationTokenRepository tokenRepository,
            OpaqueTokenService opaqueTokenService,
            EmailService emailService,
            PasswordEncoder passwordEncoder,
            @Value("${app.internal-invitations.expiration:PT72H}") Duration invitationExpiration
    ) {
        if (invitationExpiration == null || invitationExpiration.isZero() || invitationExpiration.isNegative()) {
            throw new IllegalStateException("La expiración de las invitaciones internas debe ser mayor a cero.");
        }

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.tokenRepository = tokenRepository;
        this.opaqueTokenService = opaqueTokenService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.invitationExpiration = invitationExpiration;
    }

    @Transactional
    public InternalUserInvitationResponse createInvitation(
            Long currentUserId,
            CreateInternalUserInvitationRequest request
    ) {
        User inviter = requireInternalAdmin(currentUserId);
        String firstName = request.firstName().trim();
        String lastName = request.lastName().trim();
        String email = normalizeEmail(request.email());
        Set<SystemRole> roles = normalizeRoles(request.roles());
        Instant now = Instant.now();

        User pendingUser = userRepository.findByEmailIgnoreCase(email)
                .map(existing -> prepareExistingPendingUser(existing, firstName, lastName))
                .orElseGet(() -> createPendingInternalUser(firstName, lastName, email));

        final User invitedUser;
        try {
            invitedUser = userRepository.saveAndFlush(pendingUser);
        } catch (DataIntegrityViolationException exception) {
            throw unavailableEmail();
        }

        replaceRoles(invitedUser, inviter, roles);

        OpaqueTokenService.GeneratedOpaqueToken generated = opaqueTokenService.generate();
        Instant expiresAt = now.plus(invitationExpiration);

        EmailVerificationToken activationToken = tokenRepository.findById(invitedUser.getId())
                .map(existing -> {
                    existing.rotate(generated.hash(), expiresAt, now);
                    return existing;
                })
                .orElseGet(() -> new EmailVerificationToken(
                        invitedUser,
                        generated.hash(),
                        expiresAt,
                        now
                ));

        tokenRepository.saveAndFlush(activationToken);
        emailService.sendInternalInvitationEmail(
                invitedUser.getEmail(),
                generated.value(),
                roleNames(roles)
        );

        return new InternalUserInvitationResponse(
                invitedUser.getId(),
                invitedUser.getFirstName(),
                invitedUser.getLastName(),
                invitedUser.getEmail(),
                roles,
                invitedUser.getStatus(),
                expiresAt
        );
    }

    @Transactional(readOnly = true)
    public InternalUserInvitationPreviewResponse resolveInvitation(
            InternalUserInvitationTokenRequest request
    ) {
        EmailVerificationToken token = requireAvailableToken(request.token(), false);
        User user = token.getUser();
        Set<SystemRole> roles = rolesFor(user.getId());

        return new InternalUserInvitationPreviewResponse(
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                roles,
                token.getExpiresAt()
        );
    }

    @Transactional
    public InternalUserInvitationAcceptResponse acceptInvitation(
            CompleteInternalUserInvitationRequest request
    ) {
        EmailVerificationToken token = requireAvailableToken(request.token(), true);
        User user = token.getUser();
        Set<SystemRole> roles = rolesFor(user.getId());

        if (roles.isEmpty()) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "La cuenta interna no tiene roles asignados y no puede activarse."
            );
        }

        user.activateInternal(
                passwordEncoder.encode(request.password()),
                Instant.now()
        );
        tokenRepository.delete(token);

        return new InternalUserInvitationAcceptResponse(
                user.getId(),
                user.getEmail(),
                roles,
                user.getStatus()
        );
    }

    private User requireInternalAdmin(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(this::accessDenied);

        if (user.getAccountType() != AccountType.INTERNAL
                || user.getStatus() != UserStatus.ACTIVE
                || !roleRepository.existsByIdUserIdAndIdRole(user.getId(), SystemRole.ADMIN)) {
            throw accessDenied();
        }

        return user;
    }

    private User prepareExistingPendingUser(User user, String firstName, String lastName) {
        if (user.getAccountType() != AccountType.INTERNAL
                || user.getStatus() != UserStatus.PENDING_ACTIVATION) {
            throw unavailableEmail();
        }

        user.refreshPendingInternalInvitation(firstName, lastName);
        return user;
    }

    private User createPendingInternalUser(String firstName, String lastName, String email) {
        String temporaryPassword = UUID.randomUUID().toString();
        return User.inviteInternal(
                firstName,
                lastName,
                email,
                passwordEncoder.encode(temporaryPassword)
        );
    }

    private void replaceRoles(User invitedUser, User inviter, Set<SystemRole> roles) {
        roleRepository.deleteAllByIdUserId(invitedUser.getId());
        roleRepository.flush();

        List<UserSystemRole> assignments = roles.stream()
                .map(role -> new UserSystemRole(invitedUser, role, inviter))
                .toList();

        roleRepository.saveAll(assignments);
        roleRepository.flush();
    }

    private EmailVerificationToken requireAvailableToken(String rawToken, boolean lockForUpdate) {
        String hash = opaqueTokenService.hash(rawToken.trim());
        EmailVerificationToken token = lockForUpdate
                ? tokenRepository.findByTokenHashForUpdate(hash).orElseThrow(this::invalidInvitation)
                : tokenRepository.findByTokenHash(hash).orElseThrow(this::invalidInvitation);

        if (token.isExpired(Instant.now())) {
            throw new BusinessException(
                    ApiErrorCode.INTERNAL_INVITATION_EXPIRED,
                    "La invitación interna ha expirado. Solicita al administrador que envíe una nueva."
            );
        }

        User user = token.getUser();
        if (user.getAccountType() != AccountType.INTERNAL
                || user.getStatus() != UserStatus.PENDING_ACTIVATION) {
            throw invalidInvitation();
        }

        return token;
    }

    private Set<SystemRole> rolesFor(Long userId) {
        LinkedHashSet<SystemRole> roles = new LinkedHashSet<>();
        roleRepository.findAllByIdUserId(userId).stream()
                .map(UserSystemRole::getRole)
                .sorted(Comparator.comparingInt(SystemRole::ordinal))
                .forEach(roles::add);
        return Collections.unmodifiableSet(roles);
    }

    private Set<SystemRole> normalizeRoles(Set<SystemRole> roles) {
        if (roles == null || roles.isEmpty()) {
            throw new BusinessException(
                    ApiErrorCode.VALIDATION_ERROR,
                    "Debes asignar al menos un rol al usuario interno."
            );
        }

        LinkedHashSet<SystemRole> normalized = new LinkedHashSet<>();
        roles.stream()
                .sorted(Comparator.comparingInt(SystemRole::ordinal))
                .forEach(normalized::add);
        return Collections.unmodifiableSet(normalized);
    }

    private List<String> roleNames(Set<SystemRole> roles) {
        return roles.stream()
                .sorted(Comparator.comparingInt(SystemRole::ordinal))
                .map(SystemRole::name)
                .toList();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private BusinessException unavailableEmail() {
        return new BusinessException(
                ApiErrorCode.EMAIL_ALREADY_EXISTS,
                "El correo electrónico ya pertenece a una cuenta que no puede ser invitada."
        );
    }

    private BusinessException invalidInvitation() {
        return new BusinessException(
                ApiErrorCode.INVALID_INTERNAL_INVITATION_TOKEN,
                "La invitación interna no es válida o ya fue utilizada."
        );
    }

    private BusinessException accessDenied() {
        return new BusinessException(
                ApiErrorCode.ACCESS_DENIED,
                "Solo un administrador interno activo puede invitar usuarios internos."
        );
    }
}
