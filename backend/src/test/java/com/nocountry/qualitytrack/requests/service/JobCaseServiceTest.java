package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
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
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobCaseServiceTest {

    @Mock
    private JobCaseRepository jobCaseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSystemRoleRepository userSystemRoleRepository;

    @Mock
    private User user;

    @Mock
    private UserSystemRole systemRole;

    private JobCaseService service;

    @BeforeEach
    void setUp() {
        service = new JobCaseService(
                jobCaseRepository,
                userRepository,
                userSystemRoleRepository
        );
    }

    @Test
    void rejectsCustomerAccountFromInternalCaseList() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.CUSTOMER);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.list(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(userSystemRoleRepository, never()).findAllByIdUserId(10L);
        verify(jobCaseRepository, never()).findAllByOrderByOpenedAtDesc();
    }

    @Test
    void allowsCommercialToListJobCases() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(userSystemRoleRepository.findAllByIdUserId(10L)).thenReturn(List.of(systemRole));
        when(systemRole.getRole()).thenReturn(SystemRole.COMMERCIAL);
        when(jobCaseRepository.findAllByOrderByOpenedAtDesc()).thenReturn(List.of());

        assertEquals(0, service.list(10L).size());
    }

    @Test
    void allowsAuditorToListJobCases() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(userSystemRoleRepository.findAllByIdUserId(10L)).thenReturn(List.of(systemRole));
        when(systemRole.getRole()).thenReturn(SystemRole.AUDITOR);
        when(jobCaseRepository.findAllByOrderByOpenedAtDesc()).thenReturn(List.of());

        assertEquals(0, service.list(10L).size());
    }

    @Test
    void rejectsInternalRoleWithoutCaseVisibility() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(userSystemRoleRepository.findAllByIdUserId(10L)).thenReturn(List.of(systemRole));
        when(systemRole.getRole()).thenReturn(SystemRole.PRODUCTION);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.list(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(jobCaseRepository, never()).findAllByOrderByOpenedAtDesc();
    }
}
