package com.nocountry.qualitytrack.dashboard.service;

import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.nonconformities.repository.NonConformityRepository;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.entity.TraceabilityEvent;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.repository.TraceabilityEventRepository;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
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
class InternalDashboardServiceTest {

    @Mock private JobCaseRepository jobCaseRepository;
    @Mock private QuotationRepository quotationRepository;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private NonConformityRepository nonConformityRepository;
    @Mock private DeliveryRepository deliveryRepository;
    @Mock private TraceabilityEventRepository traceabilityEventRepository;
    @Mock private UserRepository userRepository;
    @Mock private User actor;

    private InternalDashboardService service;

    @BeforeEach
    void setUp() {
        service = new InternalDashboardService(
                jobCaseRepository,
                quotationRepository,
                workOrderRepository,
                nonConformityRepository,
                deliveryRepository,
                traceabilityEventRepository,
                userRepository
        );
    }

    @Test
    void returnsOperationalDashboardForActiveInternalUser() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(actor));
        when(actor.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(actor.getStatus()).thenReturn(UserStatus.ACTIVE);

        List<JobCaseRepository.StatusCount> caseCounts = List.of(
                caseCount(JobCaseStatus.SUBMITTED, 2L),
                caseCount(JobCaseStatus.UNDER_REVIEW, 3L),
                caseCount(JobCaseStatus.WAITING_CUSTOMER_INFO, 1L),
                caseCount(JobCaseStatus.READY_FOR_QUOTATION, 4L),
                caseCount(JobCaseStatus.AWAITING_WORK_ORDER, 2L),
                caseCount(JobCaseStatus.IN_PRODUCTION, 5L),
                caseCount(JobCaseStatus.COMPLETED, 7L)
        );
        List<WorkOrderRepository.StatusCount> workOrderCounts = List.of(
                workOrderCount(WorkOrderStatus.READY_FOR_PRODUCTION, 2L),
                workOrderCount(WorkOrderStatus.IN_PRODUCTION, 3L),
                workOrderCount(WorkOrderStatus.REWORK_IN_PROGRESS, 1L),
                workOrderCount(WorkOrderStatus.QUALITY_PENDING, 2L),
                workOrderCount(WorkOrderStatus.QUALITY_HOLD, 1L),
                workOrderCount(WorkOrderStatus.READY_FOR_DELIVERY, 4L)
        );
        List<QuotationRepository.StatusCount> quotationCounts = List.of(
                quotationCount(QuotationStatus.DRAFT, 2L),
                quotationCount(QuotationStatus.SENT, 3L)
        );

        when(jobCaseRepository.countGroupedByStatus()).thenReturn(caseCounts);
        when(workOrderRepository.countGroupedByStatus()).thenReturn(workOrderCounts);
        when(quotationRepository.countGroupedByStatus()).thenReturn(quotationCounts);
        when(nonConformityRepository.countByStatus(NonConformityStatus.OPEN))
                .thenReturn(2L);
        when(deliveryRepository.countByStatus(DeliveryStatus.DISPATCHED))
                .thenReturn(1L);

        TraceabilityEvent event = mock(TraceabilityEvent.class);
        JobCase jobCase = mock(JobCase.class);
        when(event.getId()).thenReturn(90L);
        when(event.getJobCase()).thenReturn(jobCase);
        when(jobCase.getId()).thenReturn(20L);
        when(jobCase.getCaseNumber()).thenReturn("QT-000020");
        when(event.getEventType()).thenReturn(TraceabilityEventType.WORK_ORDER_DELIVERED);
        when(event.getPerformedByUser()).thenReturn(actor);
        when(actor.getFirstName()).thenReturn("Ana");
        when(actor.getLastName()).thenReturn("López");
        when(event.getOccurredAt()).thenReturn(Instant.parse("2026-09-30T18:00:00Z"));
        when(traceabilityEventRepository.findTop8ByOrderByOccurredAtDescIdDesc())
                .thenReturn(List.of(event));

        var response = service.get(10L);

        assertEquals(17L, response.overview().openCases());
        assertEquals(6L, response.overview().activeProduction());
        assertEquals(3L, response.overview().qualityAttention());
        assertEquals(4L, response.overview().readyForDelivery());

        assertEquals(2L, response.pipeline().submitted());
        assertEquals(4L, response.pipeline().readyForQuotation());
        assertEquals(2L, response.pipeline().awaitingWorkOrder());
        assertEquals(7L, response.pipeline().completed());

        assertEquals(2L, response.commercial().draftQuotations());
        assertEquals(3L, response.commercial().sentQuotations());
        assertEquals(8, response.attention().size());
        assertEquals(1, response.recentActivity().size());
        assertEquals("QT-000020", response.recentActivity().get(0).caseNumber());
        assertEquals("Ana López", response.recentActivity().get(0).performedByName());
    }

    @Test
    void rejectsCustomerAccount() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(actor));
        when(actor.getAccountType()).thenReturn(AccountType.CUSTOMER);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.get(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verifyNoInteractions(jobCaseRepository);
        verifyNoInteractions(quotationRepository);
        verifyNoInteractions(workOrderRepository);
        verifyNoInteractions(nonConformityRepository);
        verifyNoInteractions(deliveryRepository);
        verifyNoInteractions(traceabilityEventRepository);
    }

    @Test
    void rejectsSuspendedInternalAccount() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(actor));
        when(actor.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(actor.getStatus()).thenReturn(UserStatus.SUSPENDED);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.get(10L)
        );

        assertEquals(ApiErrorCode.ACCESS_DENIED, exception.getCode());
        verifyNoInteractions(jobCaseRepository);
        verifyNoInteractions(quotationRepository);
        verifyNoInteractions(workOrderRepository);
        verifyNoInteractions(nonConformityRepository);
        verifyNoInteractions(deliveryRepository);
        verifyNoInteractions(traceabilityEventRepository);
    }

    private JobCaseRepository.StatusCount caseCount(
            JobCaseStatus status,
            long total
    ) {
        JobCaseRepository.StatusCount row = mock(JobCaseRepository.StatusCount.class);
        when(row.getStatus()).thenReturn(status);
        when(row.getTotal()).thenReturn(total);
        return row;
    }

    private WorkOrderRepository.StatusCount workOrderCount(
            WorkOrderStatus status,
            long total
    ) {
        WorkOrderRepository.StatusCount row = mock(WorkOrderRepository.StatusCount.class);
        when(row.getStatus()).thenReturn(status);
        when(row.getTotal()).thenReturn(total);
        return row;
    }

    private QuotationRepository.StatusCount quotationCount(
            QuotationStatus status,
            long total
    ) {
        QuotationRepository.StatusCount row = mock(QuotationRepository.StatusCount.class);
        when(row.getStatus()).thenReturn(status);
        when(row.getTotal()).thenReturn(total);
        return row;
    }
}
