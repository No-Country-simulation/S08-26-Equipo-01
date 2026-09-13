package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
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

import java.time.Instant;
import java.time.LocalDate;
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
    private CustomerRequestDocumentService customerRequestDocumentService;

    @Mock
    private User user;

    @Mock
    private User requestedBy;

    @Mock
    private UserSystemRole systemRole;

    @Mock
    private JobCase jobCase;

    @Mock
    private CustomerRequest customerRequest;

    @Mock
    private Customer customer;

    private JobCaseService service;

    @BeforeEach
    void setUp() {
        service = new JobCaseService(
                jobCaseRepository,
                userRepository,
                userSystemRoleRepository,
                customerRequestDocumentService
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
        allowInternal(SystemRole.COMMERCIAL);
        when(jobCaseRepository.findAllByOrderByOpenedAtDesc()).thenReturn(List.of());

        assertEquals(0, service.list(10L).size());
    }

    @Test
    void allowsAuditorToListJobCases() {
        allowInternal(SystemRole.AUDITOR);
        when(jobCaseRepository.findAllByOrderByOpenedAtDesc()).thenReturn(List.of());

        assertEquals(0, service.list(10L).size());
    }

    @Test
    void includesActiveDocumentsInInternalJobCaseDetail() {
        allowInternal(SystemRole.ENGINEERING);
        stubJobCaseDetail();
        when(jobCaseRepository.findById(12L)).thenReturn(Optional.of(jobCase));

        RequestDocumentResponse document = new RequestDocumentResponse(
                7L,
                "DRAWING",
                "Plano de eje",
                null,
                42L,
                "Ana López",
                Instant.parse("2026-09-10T10:00:00Z"),
                null
        );
        when(customerRequestDocumentService.listCurrent(10L, jobCase))
                .thenReturn(List.of(document));

        var response = service.get(10L, 12L);

        assertEquals(12L, response.id());
        assertEquals(1, response.documents().size());
        assertEquals(7L, response.documents().get(0).id());
        verify(customerRequestDocumentService).listCurrent(10L, jobCase);
    }

    @Test
    void rejectsInternalRoleWithoutCaseVisibility() {
        allowInternal(SystemRole.PRODUCTION);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.list(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verify(jobCaseRepository, never()).findAllByOrderByOpenedAtDesc();
    }

    private void allowInternal(SystemRole role) {
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(userSystemRoleRepository.findAllByIdUserId(10L)).thenReturn(List.of(systemRole));
        when(systemRole.getRole()).thenReturn(role);
    }

    private void stubJobCaseDetail() {
        Instant openedAt = Instant.parse("2026-09-10T10:00:00Z");

        when(jobCase.getId()).thenReturn(12L);
        when(jobCase.getCaseNumber()).thenReturn("CASE-00000001");
        when(jobCase.getStatus()).thenReturn(JobCaseStatus.SUBMITTED);
        when(jobCase.getOpenedAt()).thenReturn(openedAt);
        when(jobCase.getCustomerRequest()).thenReturn(customerRequest);

        when(customerRequest.getId()).thenReturn(31L);
        when(customerRequest.getCustomer()).thenReturn(customer);
        when(customerRequest.getRequestNumber()).thenReturn("REQ-00000001");
        when(customerRequest.getTitle()).thenReturn("Fabricación de eje");
        when(customerRequest.getDescription()).thenReturn("Fabricar conforme al plano.");
        when(customerRequest.getQuantity()).thenReturn(25);
        when(customerRequest.getMaterialRequirementType()).thenReturn(MaterialRequirementType.SPECIFIED);
        when(customerRequest.getMaterialRequirement()).thenReturn("AISI 4140");
        when(customerRequest.getRequestedDeliveryDate()).thenReturn(LocalDate.of(2026, 10, 15));
        when(customerRequest.getRequestedByUser()).thenReturn(requestedBy);
        when(customerRequest.getCreatedAt()).thenReturn(openedAt);

        when(customer.getId()).thenReturn(20L);
        when(customer.getName()).thenReturn("Mecanizados del Pacífico");
        when(requestedBy.getId()).thenReturn(42L);
        when(requestedBy.getFirstName()).thenReturn("Ana");
        when(requestedBy.getLastName()).thenReturn("López");
    }
}
