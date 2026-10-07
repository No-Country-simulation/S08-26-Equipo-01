package com.nocountry.qualitytrack.users.service;

import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.dto.request.ChangeOwnPasswordRequest;
import com.nocountry.qualitytrack.users.dto.request.UpdateInternalUserRolesRequest;
import com.nocountry.qualitytrack.users.dto.request.UpdateInternalUserStatusRequest;
import com.nocountry.qualitytrack.users.dto.request.UpdateOwnProfileRequest;
import com.nocountry.qualitytrack.users.dto.response.InternalUserResponse;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.InternalUserAccessStatus;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InternalUserService {

    private final UserRepository userRepository;
    private final UserSystemRoleRepository roleRepository;
    private final OwnAccountService ownAccountService;
    private final DemoAccountPolicy demoAccountPolicy;

    @Transactional(readOnly = true)
    public InternalUserResponse getOwnProfile(Long currentUserId) {
        User user = ownAccountService.getActiveUser(currentUserId, AccountType.INTERNAL);
        return InternalUserResponse.from(user, rolesFor(user.getId()));
    }

    @Transactional
    public InternalUserResponse updateOwnProfile(
            Long currentUserId,
            UpdateOwnProfileRequest request
    ) {
        User user = ownAccountService.updateProfile(
                currentUserId,
                AccountType.INTERNAL,
                request
        );
        return InternalUserResponse.from(user, rolesFor(user.getId()));
    }

    @Transactional
    public void changeOwnPassword(
            Long currentUserId,
            ChangeOwnPasswordRequest request
    ) {
        ownAccountService.changePassword(currentUserId, AccountType.INTERNAL, request);
    }

    @Transactional(readOnly = true)
    public List<InternalUserResponse> list(Long currentUserId) {
        requireInternalAdmin(currentUserId);

        List<User> users = userRepository
                .findAllByAccountTypeOrderByFirstNameAscLastNameAscIdAsc(AccountType.INTERNAL);

        if (users.isEmpty()) {
            return List.of();
        }

        Map<Long, Set<SystemRole>> rolesByUser = rolesByUser();

        return users.stream()
                .map(user -> InternalUserResponse.from(
                        user,
                        rolesByUser.getOrDefault(user.getId(), Set.of())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public InternalUserResponse get(Long currentUserId, Long userId) {
        requireInternalAdmin(currentUserId);
        User user = requireInternalUser(userId);

        return InternalUserResponse.from(user, rolesFor(userId));
    }

    @Transactional
    public InternalUserResponse updateRoles(
            Long currentUserId,
            Long userId,
            UpdateInternalUserRolesRequest request
    ) {
        User actor = requireInternalAdmin(currentUserId);
        requireDifferentUser(actor.getId(), userId);

        User target = requireInternalUserForUpdate(userId);
        Set<SystemRole> requestedRoles = normalizeRoles(request.roles());
        Set<SystemRole> currentRoles = rolesFor(target.getId());

        if (currentRoles.equals(requestedRoles)) {
            return InternalUserResponse.from(target, currentRoles);
        }

        if (target.getStatus() == UserStatus.ACTIVE
                && currentRoles.contains(SystemRole.ADMIN)
                && !requestedRoles.contains(SystemRole.ADMIN)) {
            ensureAnotherActiveAdmin(target.getId());
        }

        roleRepository.deleteAllByIdUserId(target.getId());
        roleRepository.flush();

        List<UserSystemRole> assignments = requestedRoles.stream()
                .map(role -> new UserSystemRole(target, role, actor))
                .toList();

        roleRepository.saveAll(assignments);
        roleRepository.flush();

        return InternalUserResponse.from(target, requestedRoles);
    }

    @Transactional
    public InternalUserResponse updateStatus(
            Long currentUserId,
            Long userId,
            UpdateInternalUserStatusRequest request
    ) {
        User actor = requireInternalAdmin(currentUserId);
        requireDifferentUser(actor.getId(), userId);

        User target = requireInternalUserForUpdate(userId);
        InternalUserAccessStatus requestedStatus = request.status();

        if (target.getStatus() == UserStatus.PENDING_ACTIVATION) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "La cuenta todavía debe completar su invitación antes de que pueda suspenderse o reactivarse."
            );
        }

        if (target.getStatus() == UserStatus.PENDING_VERIFICATION) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "La cuenta interna se encuentra en un estado no administrable desde este flujo."
            );
        }

        UserStatus desiredStatus = requestedStatus == InternalUserAccessStatus.ACTIVE
                ? UserStatus.ACTIVE
                : UserStatus.SUSPENDED;

        if (target.getStatus() == desiredStatus) {
            return InternalUserResponse.from(target, rolesFor(target.getId()));
        }

        Set<SystemRole> roles = rolesFor(target.getId());

        if (desiredStatus == UserStatus.SUSPENDED
                && roles.contains(SystemRole.ADMIN)) {
            ensureAnotherActiveAdmin(target.getId());
        }

        if (desiredStatus == UserStatus.SUSPENDED) {
            target.suspendInternal();
        } else {
            target.reactivateInternal();
        }

        userRepository.saveAndFlush(target);
        return InternalUserResponse.from(target, roles);
    }

    private User requireInternalAdmin(Long currentUserId) {
        demoAccountPolicy.requireIdentityMutationAllowed(currentUserId);

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "Solo un administrador interno activo puede administrar usuarios."
                ));

        if (user.getAccountType() != AccountType.INTERNAL
                || user.getStatus() != UserStatus.ACTIVE
                || !roleRepository.existsByIdUserIdAndIdRole(user.getId(), SystemRole.ADMIN)) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo un administrador interno activo puede administrar usuarios."
            );
        }

        return user;
    }

    private User requireInternalUser(Long userId) {
        return userRepository.findByIdAndAccountType(userId, AccountType.INTERNAL)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el usuario interno."
                ));
    }

    private User requireInternalUserForUpdate(Long userId) {
        User user = userRepository.findByIdForUpdate(userId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el usuario interno."
                ));

        if (user.getAccountType() != AccountType.INTERNAL) {
            throw new BusinessException(
                    ApiErrorCode.RESOURCE_NOT_FOUND,
                    "No se encontró el usuario interno."
            );
        }

        return user;
    }

    private void requireDifferentUser(Long currentUserId, Long targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "Tu propio acceso debe ser administrado por otro administrador interno."
            );
        }
    }

    private void ensureAnotherActiveAdmin(Long targetUserId) {
        List<User> activeAdmins = userRepository.findInternalUsersByRoleAndStatusForUpdate(
                AccountType.INTERNAL,
                UserStatus.ACTIVE,
                SystemRole.ADMIN
        );

        boolean hasAnotherAdmin = activeAdmins.stream()
                .anyMatch(user -> !user.getId().equals(targetUserId));

        if (!hasAnotherAdmin) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "Debe permanecer al menos un administrador interno activo."
            );
        }
    }

    private Map<Long, Set<SystemRole>> rolesByUser() {
        Map<Long, LinkedHashSet<SystemRole>> grouped = roleRepository
                .findAllByUser_AccountType(AccountType.INTERNAL)
                .stream()
                .sorted(Comparator.comparingInt(role -> role.getRole().ordinal()))
                .collect(Collectors.groupingBy(
                        role -> role.getUser().getId(),
                        LinkedHashMap::new,
                        Collectors.mapping(
                                UserSystemRole::getRole,
                                Collectors.toCollection(LinkedHashSet::new)
                        )
                ));

        Map<Long, Set<SystemRole>> result = new LinkedHashMap<>();
        grouped.forEach((userId, roles) ->
                result.put(userId, Collections.unmodifiableSet(roles)));
        return result;
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
}
