package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkOrderAccessPolicyTest {

    @Mock private UserRepository userRepository;
    @Mock private UserSystemRoleRepository userSystemRoleRepository;
    @Mock private User user;
    @Mock private UserSystemRole systemRole;

    private WorkOrderAccessPolicy policy;

    @BeforeEach
    void setUp() {
        policy = new WorkOrderAccessPolicy(userRepository, userSystemRoleRepository);
    }

    @Test
    void commercialCanCreateWorkOrders() {
        allowInternal(SystemRole.COMMERCIAL);

        assertSame(user, policy.requireCreationActor(10L));
    }

    @Test
    void productionCannotCreateOrPrepareWorkOrdersButCanManageProduction() {
        allowInternal(SystemRole.PRODUCTION);

        BusinessException createException = assertThrows(
                BusinessException.class,
                () -> policy.requireCreationActor(10L)
        );
        BusinessException planningException = assertThrows(
                BusinessException.class,
                () -> policy.requirePlanningActor(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, createException.getCode());
        assertEquals(ApiErrorCode.ACCESS_DENIED, planningException.getCode());
        assertSame(user, policy.requireProductionActor(10L));
    }

    @Test
    void engineeringCanPrepareWorkOrdersButCannotManageProduction() {
        allowInternal(SystemRole.ENGINEERING);

        assertSame(user, policy.requirePlanningActor(10L));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> policy.requireProductionActor(10L)
        );
        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
    }

    @Test
    void qualityCanReadWorkOrders() {
        allowInternal(SystemRole.QUALITY);

        policy.requireInternalReader(10L);

        verify(userSystemRoleRepository).findAllByIdUserId(10L);
    }

    @Test
    void customerAccountCannotReadWorkOrders() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.CUSTOMER);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> policy.requireInternalReader(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(userSystemRoleRepository, never()).findAllByIdUserId(10L);
    }

    private void allowInternal(SystemRole role) {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(userSystemRoleRepository.findAllByIdUserId(10L)).thenReturn(List.of(systemRole));
        when(systemRole.getRole()).thenReturn(role);
    }
}
