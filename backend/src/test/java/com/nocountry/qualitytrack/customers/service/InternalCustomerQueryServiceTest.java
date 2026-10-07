package com.nocountry.qualitytrack.customers.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.enums.CustomerStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
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

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InternalCustomerQueryServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMembershipRepository membershipRepository;

    @Mock
    private JobCaseRepository jobCaseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private User actor;

    @Mock
    private Customer customer;

    private InternalCustomerQueryService service;

    @BeforeEach
    void setUp() {
        service = new InternalCustomerQueryService(
                customerRepository,
                membershipRepository,
                jobCaseRepository,
                userRepository
        );
    }

    @Test
    void listsCustomersWithOperationalMetrics() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(actor));
        when(actor.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(actor.getStatus()).thenReturn(UserStatus.ACTIVE);

        when(customer.getId()).thenReturn(20L);
        when(customer.getName()).thenReturn("Maquinados del Pacífico");
        when(customer.getStatus()).thenReturn(CustomerStatus.ACTIVE);
        when(customer.getCreatedAt()).thenReturn(Instant.parse("2026-09-01T12:00:00Z"));
        when(customerRepository.findAllByOrderByNameAscIdAsc())
                .thenReturn(List.of(customer));

        CustomerMembershipRepository.CustomerMemberCount members =
                mock(CustomerMembershipRepository.CustomerMemberCount.class);
        when(members.getCustomerId()).thenReturn(20L);
        when(members.getTotal()).thenReturn(3L);
        when(membershipRepository.countByCustomerAndStatus(
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(List.of(members));

        JobCaseRepository.CustomerStatusCount review =
                caseCount(20L, JobCaseStatus.UNDER_REVIEW, 2L);
        JobCaseRepository.CustomerStatusCount production =
                caseCount(20L, JobCaseStatus.IN_PRODUCTION, 1L);
        JobCaseRepository.CustomerStatusCount completed =
                caseCount(20L, JobCaseStatus.COMPLETED, 4L);
        JobCaseRepository.CustomerStatusCount cancelled =
                caseCount(20L, JobCaseStatus.CANCELLED, 1L);

        when(jobCaseRepository.countByCustomerAndStatus())
                .thenReturn(List.of(review, production, completed, cancelled));

        var response = service.list(10L);

        assertEquals(1, response.size());
        assertEquals(20L, response.get(0).id());
        assertEquals("Maquinados del Pacífico", response.get(0).name());
        assertEquals(3L, response.get(0).activeMembers());
        assertEquals(3L, response.get(0).openCases());
        assertEquals(4L, response.get(0).completedCases());
        assertEquals(1L, response.get(0).cancelledCases());
    }

    @Test
    void rejectsCustomerAccountFromInternalCustomerDirectory() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(actor));
        when(actor.getAccountType()).thenReturn(AccountType.CUSTOMER);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.list(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verifyNoInteractions(customerRepository);
        verifyNoInteractions(membershipRepository);
        verifyNoInteractions(jobCaseRepository);
    }

    @Test
    void rejectsSuspendedInternalAccount() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(actor));
        when(actor.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(actor.getStatus()).thenReturn(UserStatus.SUSPENDED);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.list(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verifyNoInteractions(customerRepository);
        verifyNoInteractions(membershipRepository);
        verifyNoInteractions(jobCaseRepository);
    }

    private JobCaseRepository.CustomerStatusCount caseCount(
            Long customerId,
            JobCaseStatus status,
            long total
    ) {
        JobCaseRepository.CustomerStatusCount count =
                mock(JobCaseRepository.CustomerStatusCount.class);
        when(count.getCustomerId()).thenReturn(customerId);
        when(count.getStatus()).thenReturn(status);
        when(count.getTotal()).thenReturn(total);
        return count;
    }
}
