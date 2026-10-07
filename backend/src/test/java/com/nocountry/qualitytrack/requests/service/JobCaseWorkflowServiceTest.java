package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.requests.dto.request.CreateCaseInformationRequest;
import com.nocountry.qualitytrack.requests.dto.request.RespondCaseInformationRequest;
import com.nocountry.qualitytrack.requests.entity.CaseInformationRequest;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.requests.repository.CaseInformationRequestRepository;
import com.nocountry.qualitytrack.requests.repository.CaseMaterialSpecificationRepository;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobCaseWorkflowServiceTest {

    @Mock
    private JobCaseRepository jobCaseRepository;
    @Mock
    private CaseInformationRequestRepository informationRequestRepository;
    @Mock
    private CaseMaterialSpecificationRepository materialSpecificationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserSystemRoleRepository userSystemRoleRepository;
    @Mock
    private CustomerMembershipRepository customerMembershipRepository;
    @Mock
    private TraceabilityService traceabilityService;
    @Mock
    private User internalUser;
    @Mock
    private User requester;
    @Mock
    private User customerUser;
    @Mock
    private UserSystemRole systemRole;
    @Mock
    private Customer customer;
    @Mock
    private CustomerMembership membership;

    private JobCaseWorkflowService service;

    @BeforeEach
    void setUp() {
        service = new JobCaseWorkflowService(
                jobCaseRepository,
                informationRequestRepository,
                materialSpecificationRepository,
                userRepository,
                userSystemRoleRepository,
                customerMembershipRepository,
                traceabilityService
        );
    }

    @Test
    void commercialTakingSubmittedCaseAssignsItAndStartsReview() {
        allowInternal(SystemRole.COMMERCIAL);
        JobCase jobCase = newJobCase(MaterialRequirementType.SPECIFIED);
        when(jobCaseRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(jobCase));
        when(jobCaseRepository.saveAndFlush(jobCase)).thenReturn(jobCase);

        var response = service.take(10L, 12L);

        assertEquals(JobCaseStatus.UNDER_REVIEW, response.status());
        assertEquals(10L, response.assignedToUserId());
        verify(traceabilityService).record(
                eq(jobCase),
                any(),
                any(),
                eq(TraceabilityEventType.JOB_CASE_REVIEW_STARTED),
                eq(JobCaseStatus.SUBMITTED.name()),
                eq(JobCaseStatus.UNDER_REVIEW.name()),
                eq(10L),
                any()
        );
    }

    @Test
    void requestingInformationMovesCaseToWaitingCustomerInfo() {
        allowInternal(SystemRole.COMMERCIAL);
        JobCase jobCase = reviewedJobCase(MaterialRequirementType.SPECIFIED);
        when(jobCaseRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(jobCase));
        when(userSystemRoleRepository.existsByIdUserIdAndIdRole(10L, SystemRole.ADMIN)).thenReturn(false);
        when(informationRequestRepository.existsByJobCase_IdAndRespondedAtIsNull(12L)).thenReturn(false);
        when(informationRequestRepository.saveAndFlush(any(CaseInformationRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(jobCaseRepository.saveAndFlush(jobCase)).thenReturn(jobCase);

        service.requestInformation(
                10L,
                12L,
                new CreateCaseInformationRequest("¿Puede confirmar la tolerancia del diámetro?")
        );

        assertEquals(JobCaseStatus.WAITING_CUSTOMER_INFO, jobCase.getStatus());
        verify(traceabilityService).record(
                eq(jobCase),
                any(),
                any(),
                eq(TraceabilityEventType.CUSTOMER_INFORMATION_REQUESTED),
                eq(JobCaseStatus.UNDER_REVIEW.name()),
                eq(JobCaseStatus.WAITING_CUSTOMER_INFO.name()),
                eq(10L),
                any()
        );
    }

    @Test
    void customerResponseReturnsCaseToReview() {
        JobCase jobCase = reviewedJobCase(MaterialRequirementType.SPECIFIED);
        CaseInformationRequest informationRequest = CaseInformationRequest.open(
                jobCase,
                "¿Puede confirmar la tolerancia?",
                internalUser,
                Instant.now()
        );
        jobCase.waitForCustomerInfo();

        when(customerMembershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                20L,
                42L,
                CustomerMembershipStatus.ACTIVE
        )).thenReturn(Optional.of(membership));
        when(membership.getRole()).thenReturn(CustomerMembershipRole.REQUESTER);
        when(membership.getUser()).thenReturn(customerUser);
        when(jobCaseRepository.findByRequestAndCustomerForUpdate(31L, 20L))
                .thenReturn(Optional.of(jobCase));
        when(informationRequestRepository.findByIdAndJobCase_Id(7L, null))
                .thenReturn(Optional.of(informationRequest));
        when(informationRequestRepository.saveAndFlush(informationRequest)).thenReturn(informationRequest);
        when(jobCaseRepository.saveAndFlush(jobCase)).thenReturn(jobCase);

        service.respondInformation(
                42L,
                20L,
                31L,
                7L,
                new RespondCaseInformationRequest("La tolerancia requerida es ±0.02 mm.")
        );

        assertEquals(JobCaseStatus.UNDER_REVIEW, jobCase.getStatus());
        verify(traceabilityService).record(
                eq(jobCase),
                any(),
                any(),
                eq(TraceabilityEventType.CUSTOMER_INFORMATION_RESPONDED),
                eq(JobCaseStatus.WAITING_CUSTOMER_INFO.name()),
                eq(JobCaseStatus.UNDER_REVIEW.name()),
                eq(42L),
                any()
        );
    }

    @Test
    void assistanceRequiredCannotCompleteWithoutMaterialSpecification() {
        allowInternal(SystemRole.COMMERCIAL);
        JobCase jobCase = reviewedJobCase(MaterialRequirementType.ASSISTANCE_REQUIRED);
        when(jobCaseRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(jobCase));
        when(userSystemRoleRepository.existsByIdUserIdAndIdRole(10L, SystemRole.ADMIN)).thenReturn(false);
        when(informationRequestRepository.existsByJobCase_IdAndRespondedAtIsNull(12L)).thenReturn(false);
        when(materialSpecificationRepository.findByJobCase_Id(12L)).thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.completeReview(10L, 12L)
        );

        assertEquals(ApiErrorCode.DATA_CONFLICT, exception.getCode());
        assertEquals(JobCaseStatus.UNDER_REVIEW, jobCase.getStatus());
        verify(jobCaseRepository, never()).saveAndFlush(jobCase);
    }

    @Test
    void specifiedMaterialCanCompleteReviewWithoutInternalSpecification() {
        allowInternal(SystemRole.COMMERCIAL);
        JobCase jobCase = reviewedJobCase(MaterialRequirementType.SPECIFIED);
        when(jobCaseRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(jobCase));
        when(userSystemRoleRepository.existsByIdUserIdAndIdRole(10L, SystemRole.ADMIN)).thenReturn(false);
        when(informationRequestRepository.existsByJobCase_IdAndRespondedAtIsNull(12L)).thenReturn(false);
        when(jobCaseRepository.saveAndFlush(jobCase)).thenReturn(jobCase);

        var response = service.completeReview(10L, 12L);

        assertEquals(JobCaseStatus.READY_FOR_QUOTATION, response.status());
        verify(traceabilityService).record(
                eq(jobCase),
                any(),
                any(),
                eq(TraceabilityEventType.JOB_CASE_READY_FOR_QUOTATION),
                eq(JobCaseStatus.UNDER_REVIEW.name()),
                eq(JobCaseStatus.READY_FOR_QUOTATION.name()),
                eq(10L),
                any()
        );
    }

    private void allowInternal(SystemRole role) {
        when(userRepository.findById(10L)).thenReturn(Optional.of(internalUser));
        when(internalUser.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(internalUser.getId()).thenReturn(10L);
        when(userSystemRoleRepository.findAllByIdUserId(10L)).thenReturn(List.of(systemRole));
        when(systemRole.getRole()).thenReturn(role);
    }

    private JobCase reviewedJobCase(MaterialRequirementType materialRequirementType) {
        JobCase jobCase = newJobCase(materialRequirementType);
        jobCase.takeForReview(internalUser, Instant.now());
        return jobCase;
    }

    private JobCase newJobCase(MaterialRequirementType materialRequirementType) {
        CustomerRequest request = CustomerRequest.submit(
                customer,
                "REQ-00000001",
                null,
                "Eje de transmisión",
                "Fabricar conforme al plano.",
                25,
                materialRequirementType,
                materialRequirementType == MaterialRequirementType.SPECIFIED
                        ? "AISI 4140"
                        : "Requiere asesoría",
                LocalDate.of(2026, 10, 15),
                requester
        );
        return JobCase.open(request, "CASE-00000001", Instant.now());
    }
}
