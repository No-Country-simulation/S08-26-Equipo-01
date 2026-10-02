package com.nocountry.qualitytrack.users.service;

import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.dto.request.UpdateInternalUserRolesRequest;
import com.nocountry.qualitytrack.users.dto.request.UpdateInternalUserStatusRequest;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.InternalUserAccessStatus;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InternalUserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserSystemRoleRepository roleRepository;

    private InternalUserService service;

    @BeforeEach
    void setUp() {
        service = new InternalUserService(userRepository, roleRepository);
    }

    @Test
    void adminCanReplaceRolesOfAnotherInternalUser() {
        User admin = internal("Admin", "Root", "admin@qualitytrack.local", 1L);
        User target = internal("Ana", "Torres", "ana@qualitytrack.local", 2L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(roleRepository.existsByIdUserIdAndIdRole(1L, SystemRole.ADMIN)).thenReturn(true);
        when(userRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(target));
        when(roleRepository.findAllByIdUserId(2L)).thenReturn(List.of(
                new UserSystemRole(target, SystemRole.COMMERCIAL, admin)
        ));

        var response = service.updateRoles(
                1L,
                2L,
                new UpdateInternalUserRolesRequest(Set.of(
                        SystemRole.ENGINEERING,
                        SystemRole.QUALITY
                ))
        );

        assertEquals(List.of(SystemRole.ENGINEERING, SystemRole.QUALITY), response.roles());
        verify(roleRepository).deleteAllByIdUserId(2L);
        verify(roleRepository).saveAll(any());
    }

    @Test
    void cannotModifyOwnAccess() {
        User admin = internal("Admin", "Root", "admin@qualitytrack.local", 1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(roleRepository.existsByIdUserIdAndIdRole(1L, SystemRole.ADMIN)).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.updateRoles(
                        1L,
                        1L,
                        new UpdateInternalUserRolesRequest(Set.of(SystemRole.ADMIN))
                )
        );

        assertEquals(ApiErrorCode.DATA_CONFLICT, exception.getCode());
    }

    @Test
    void cannotSuspendLastActiveAdmin() {
        User actor = internal("Admin", "One", "admin1@qualitytrack.local", 1L);
        User target = internal("Admin", "Two", "admin2@qualitytrack.local", 2L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(actor));
        when(roleRepository.existsByIdUserIdAndIdRole(1L, SystemRole.ADMIN)).thenReturn(true);
        when(userRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(target));
        when(roleRepository.findAllByIdUserId(2L)).thenReturn(List.of(
                new UserSystemRole(target, SystemRole.ADMIN, actor)
        ));
        when(userRepository.findInternalUsersByRoleAndStatusForUpdate(
                AccountType.INTERNAL,
                UserStatus.ACTIVE,
                SystemRole.ADMIN
        )).thenReturn(List.of(target));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.updateStatus(
                        1L,
                        2L,
                        new UpdateInternalUserStatusRequest(InternalUserAccessStatus.SUSPENDED)
                )
        );

        assertEquals(ApiErrorCode.DATA_CONFLICT, exception.getCode());
    }

    private User internal(String firstName, String lastName, String email, Long id) {
        User user = User.createActiveInternal(firstName, lastName, email, "hash");
        ReflectionTestUtils.setField(user, "id", id);
        return user;
    }
}
