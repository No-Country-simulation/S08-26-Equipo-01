package com.nocountry.qualitytrack.search.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.enums.CustomerStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.materials.repository.MaterialLotRepository;
import com.nocountry.qualitytrack.materials.repository.MaterialRepository;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.search.enums.InternalSearchResultType;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InternalSearchServiceTest {

    @Mock private CustomerRepository customerRepository;
    @Mock private JobCaseRepository jobCaseRepository;
    @Mock private QuotationRepository quotationRepository;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private MaterialRepository materialRepository;
    @Mock private MaterialLotRepository materialLotRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserSystemRoleRepository userSystemRoleRepository;
    @Mock private User actor;

    private InternalSearchService service;

    @BeforeEach
    void setUp() {
        service = new InternalSearchService(
                customerRepository,
                jobCaseRepository,
                quotationRepository,
                workOrderRepository,
                materialRepository,
                materialLotRepository,
                documentRepository,
                userRepository,
                userSystemRoleRepository
        );
    }

    @Test
    void productionSearchesOperationalDataButNotQuotations() {
        authorize(SystemRole.PRODUCTION);

        Customer customer = mock(Customer.class);
        when(customer.getId()).thenReturn(30L);
        when(customer.getName()).thenReturn("Acme Mecanizados");
        when(customer.getRfc()).thenReturn("ACM010101AA1");
        when(customer.getStatus()).thenReturn(CustomerStatus.ACTIVE);

        when(customerRepository.searchInternal(
                ArgumentMatchers.eq("%acme%"),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(List.of(customer));
        stubEmptyOperationalSearch("%acme%");

        var response = service.search(10L, "Acme");

        assertEquals("Acme", response.query());
        assertEquals(1, response.results().size());
        assertEquals(InternalSearchResultType.CUSTOMER, response.results().get(0).type());
        assertEquals("/customers/30", response.results().get(0).href());

        verify(jobCaseRepository).searchInternal(
                ArgumentMatchers.eq("%acme%"),
                ArgumentMatchers.any(Pageable.class)
        );
        verify(workOrderRepository).searchInternal(
                ArgumentMatchers.eq("%acme%"),
                ArgumentMatchers.any(Pageable.class)
        );
        verify(materialRepository).searchInternal(
                ArgumentMatchers.eq("%acme%"),
                ArgumentMatchers.any(Pageable.class)
        );
        verify(materialLotRepository).searchInternal(
                ArgumentMatchers.eq("%acme%"),
                ArgumentMatchers.any(Pageable.class)
        );
        verify(documentRepository).searchInternal(
                ArgumentMatchers.any(),
                ArgumentMatchers.eq("%acme%"),
                ArgumentMatchers.any(Pageable.class)
        );
        verifyNoInteractions(quotationRepository);
    }

    @Test
    void commercialSearchesQuotations() {
        authorize(SystemRole.COMMERCIAL);
        when(customerRepository.searchInternal(
                ArgumentMatchers.eq("%qt-00%"),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(List.of());
        stubEmptyOperationalSearch("%qt-00%");
        when(quotationRepository.searchCurrentInternal(
                ArgumentMatchers.eq("%qt-00%"),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(List.of());

        service.search(10L, "QT-00");

        verify(quotationRepository).searchCurrentInternal(
                ArgumentMatchers.eq("%qt-00%"),
                ArgumentMatchers.any(Pageable.class)
        );
    }

    @Test
    void rejectsSuspendedInternalUserBeforeSearching() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(actor));
        when(actor.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(actor.getStatus()).thenReturn(UserStatus.SUSPENDED);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.search(10L, "QT")
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verifyNoInteractions(customerRepository);
        verifyNoInteractions(jobCaseRepository);
        verifyNoInteractions(quotationRepository);
        verifyNoInteractions(workOrderRepository);
        verifyNoInteractions(materialRepository);
        verifyNoInteractions(materialLotRepository);
        verifyNoInteractions(documentRepository);
        verifyNoInteractions(userSystemRoleRepository);
    }

    private void stubEmptyOperationalSearch(String pattern) {
        when(jobCaseRepository.searchInternal(
                ArgumentMatchers.eq(pattern),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(List.of());
        when(workOrderRepository.searchInternal(
                ArgumentMatchers.eq(pattern),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(List.of());
        when(materialRepository.searchInternal(
                ArgumentMatchers.eq(pattern),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(List.of());
        when(materialLotRepository.searchInternal(
                ArgumentMatchers.eq(pattern),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(List.of());
        when(documentRepository.searchInternal(
                ArgumentMatchers.any(),
                ArgumentMatchers.eq(pattern),
                ArgumentMatchers.any(Pageable.class)
        )).thenReturn(List.of());
    }

    private void authorize(SystemRole role) {
        UserSystemRole assignment = mock(UserSystemRole.class);

        when(userRepository.findById(10L)).thenReturn(Optional.of(actor));
        when(actor.getId()).thenReturn(10L);
        when(actor.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(actor.getStatus()).thenReturn(UserStatus.ACTIVE);
        when(assignment.getRole()).thenReturn(role);
        when(userSystemRoleRepository.findAllByIdUserId(10L))
                .thenReturn(List.of(assignment));
    }
}
