package com.nocountry.qualitytrack.customers.service;

import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.request.UpdateCustomerRequest;
import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMembershipRepository membershipRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private User user;

    @Mock
    private Customer customer;

    @Mock
    private CustomerMembership actorMembership;

    @Mock
    private CustomerMembership targetMembership;

    private CustomerService service;

    @BeforeEach
    void setUp() {
        service = new CustomerService(customerRepository, membershipRepository, userRepository);
    }

    @Test
    void createsCustomerAndInitialAdminMembership() {
        CreateCustomerRequest request = new CreateCustomerRequest(
                " Taller Norte ",
                " XAXX010101000 ",
                null,
                " admin@example.com ",
                " Tepic ",
                " Nayarit ",
                null
        );

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(customerRepository.saveAndFlush(any(Customer.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.createCustomer(10L, request);

        ArgumentCaptor<Customer> customerCaptor = ArgumentCaptor.forClass(Customer.class);
        verify(customerRepository).saveAndFlush(customerCaptor.capture());
        Customer savedCustomer = customerCaptor.getValue();

        assertEquals("Taller Norte", savedCustomer.getName());
        assertEquals("XAXX010101000", savedCustomer.getRfc());
        assertEquals("admin@example.com", savedCustomer.getAdministrativeEmail());
        assertEquals(user, savedCustomer.getCreatedByUser());

        ArgumentCaptor<CustomerMembership> membershipCaptor = ArgumentCaptor.forClass(CustomerMembership.class);
        verify(membershipRepository).save(membershipCaptor.capture());
        CustomerMembership membership = membershipCaptor.getValue();

        assertEquals(savedCustomer, membership.getCustomer());
        assertEquals(user, membership.getUser());
        assertEquals(CustomerMembershipRole.ADMIN, membership.getRole());
        assertEquals(CustomerMembershipStatus.ACTIVE, membership.getStatus());
        assertNotNull(membership.getJoinedAt());
        assertNull(membership.getInvitedByUser());
    }

    @Test
    void rejectsInternalUserCreatingCustomer() {
        CreateCustomerRequest request = new CreateCustomerRequest(
                "Taller Norte", null, null, null, null, null, null
        );

        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.INTERNAL);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.createCustomer(10L, request)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(customerRepository, never()).saveAndFlush(any(Customer.class));
        verify(membershipRepository, never()).save(any(CustomerMembership.class));
    }

    @Test
    void listsOnlyActiveMembers() {
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(actorMembership));
        when(membershipRepository.findAllByCustomer_IdAndStatusOrderByCreatedAtAsc(
                20L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(List.of());

        service.listMembers(10L, 20L);

        verify(membershipRepository).findAllByCustomer_IdAndStatusOrderByCreatedAtAsc(
                20L,
                CustomerMembershipStatus.ACTIVE
        );
    }

    @Test
    void rejectsMemberListForUserOutsideCustomer() {
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.listMembers(10L, 20L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(membershipRepository, never())
                .findAllByCustomer_IdAndStatusOrderByCreatedAtAsc(
                        20L,
                        CustomerMembershipStatus.ACTIVE
                );
    }

    @Test
    void rejectsCompanyUpdateForNonAdminMember() {
        UpdateCustomerRequest request = new UpdateCustomerRequest(
                "Nuevo nombre", null, null, null, null, null, null
        );

        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(actorMembership));
        when(actorMembership.getRole()).thenReturn(CustomerMembershipRole.VIEWER);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.updateCustomer(10L, 20L, request)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(customerRepository, never()).findById(20L);
    }

    @Test
    void removesActiveMemberWhenActorIsAdmin() {
        when(customerRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(customer));
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(actorMembership));
        when(actorMembership.getRole()).thenReturn(CustomerMembershipRole.ADMIN);
        when(actorMembership.getUser()).thenReturn(user);
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                11L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(targetMembership));
        when(targetMembership.getRole()).thenReturn(CustomerMembershipRole.REQUESTER);

        service.removeMember(10L, 20L, 11L);

        verify(targetMembership).remove(eq(user), any(Instant.class));
        verify(membershipRepository).save(targetMembership);
    }

    @Test
    void rejectsRemovingLastActiveAdmin() {
        when(customerRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(customer));
        when(membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                10L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(actorMembership));
        when(actorMembership.getRole()).thenReturn(CustomerMembershipRole.ADMIN);
        when(membershipRepository.countByCustomer_IdAndRoleAndStatus(
                20L,
                CustomerMembershipRole.ADMIN,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(1L);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.removeMember(10L, 20L, 10L)
        );

        assertEquals(ApiErrorCode.DATA_CONFLICT, exception.getCode());
        verify(actorMembership, never()).remove(any(User.class), any(Instant.class));
    }
}
