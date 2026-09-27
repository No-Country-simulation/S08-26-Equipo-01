package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.entity.QuotationItem;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.dto.request.CancelWorkOrderRequest;
import com.nocountry.qualitytrack.workorders.dto.request.CreateWorkOrderRequest;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkOrderWorkflowServiceTest {

    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private JobCaseRepository jobCaseRepository;
    @Mock private QuotationRepository quotationRepository;
    @Mock private WorkOrderReferenceGenerator referenceGenerator;
    @Mock private WorkOrderAccessPolicy accessPolicy;
    @Mock private WorkOrderSourceService sourceService;
    @Mock private WorkOrderDocumentService documentService;
    @Mock private TraceabilityService traceabilityService;
    @Mock private User productionUser;
    @Mock private User commercialUser;
    @Mock private User requester;
    @Mock private Customer customer;

    private WorkOrderWorkflowService service;

    @BeforeEach
    void setUp() {
        service = new WorkOrderWorkflowService(
                workOrderRepository,
                jobCaseRepository,
                quotationRepository,
                referenceGenerator,
                accessPolicy,
                sourceService,
                documentService,
                traceabilityService
        );
    }

    @Test
    void createRequiresApprovedQuotationAndMovesCaseToProduction() {
        JobCase jobCase = readyJobCase();
        Quotation approved = approvedQuotation(jobCase);

        when(accessPolicy.requireCreationActor(10L)).thenReturn(productionUser);
        when(jobCaseRepository.findByIdForUpdate(3L)).thenReturn(Optional.of(jobCase));
        when(workOrderRepository.existsByJobCase_Id(3L)).thenReturn(false);
        when(quotationRepository.findByJobCase_IdAndStatus(3L, QuotationStatus.APPROVED))
                .thenReturn(Optional.of(approved));
        when(referenceGenerator.nextWorkOrderNumber()).thenReturn("OT-00000001");
        when(workOrderRepository.saveAndFlush(any(WorkOrder.class)))
                .thenAnswer(invocation -> {
                    WorkOrder saved = invocation.getArgument(0);
                    ReflectionTestUtils.setField(saved, "id", 7L);
                    return saved;
                });
        when(documentService.listPinned(7L)).thenReturn(List.of());

        var response = service.create(10L, 3L, createRequest());

        assertEquals(WorkOrderStatus.CREATED, response.status());
        assertEquals("OT-00000001", response.workOrderNumber());
        assertEquals(WorkOrderPriority.NORMAL, response.priority());
        assertEquals(LocalDate.of(2026, 10, 1), response.plannedStartDate());
        assertEquals(LocalDate.of(2026, 10, 15), response.plannedEndDate());
        assertEquals(approved.getEstimatedDeliveryDate(), response.agreedDeliveryDate());
        assertEquals(JobCaseStatus.IN_PRODUCTION, jobCase.getStatus());
        verify(traceabilityService, times(2)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void createFailsWithoutApprovedQuotation() {
        JobCase jobCase = readyJobCase();

        when(accessPolicy.requireCreationActor(10L)).thenReturn(productionUser);
        when(jobCaseRepository.findByIdForUpdate(3L)).thenReturn(Optional.of(jobCase));
        when(workOrderRepository.existsByJobCase_Id(3L)).thenReturn(false);
        when(quotationRepository.findByJobCase_IdAndStatus(3L, QuotationStatus.APPROVED))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessException.class,
                () -> service.create(10L, 3L, createRequest())
        );
    }

    @Test
    void createFailsWhenCaseAlreadyHasWorkOrder() {
        JobCase jobCase = readyJobCase();

        when(accessPolicy.requireCreationActor(10L)).thenReturn(productionUser);
        when(jobCaseRepository.findByIdForUpdate(3L)).thenReturn(Optional.of(jobCase));
        when(workOrderRepository.existsByJobCase_Id(3L)).thenReturn(true);

        assertThrows(
                BusinessException.class,
                () -> service.create(10L, 3L, createRequest())
        );
    }

    @Test
    void createRejectsPlanningThatFinishesOnCommittedDelivery() {
        JobCase jobCase = readyJobCase();
        Quotation approved = approvedQuotation(jobCase);

        when(accessPolicy.requireCreationActor(10L)).thenReturn(productionUser);
        when(jobCaseRepository.findByIdForUpdate(3L)).thenReturn(Optional.of(jobCase));
        when(workOrderRepository.existsByJobCase_Id(3L)).thenReturn(false);
        when(quotationRepository.findByJobCase_IdAndStatus(3L, QuotationStatus.APPROVED))
                .thenReturn(Optional.of(approved));
        when(referenceGenerator.nextWorkOrderNumber()).thenReturn("OT-00000001");

        CreateWorkOrderRequest invalid = new CreateWorkOrderRequest(
                WorkOrderPriority.NORMAL,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 20)
        );

        assertThrows(BusinessException.class, () -> service.create(10L, 3L, invalid));
        verify(workOrderRepository, never()).saveAndFlush(any(WorkOrder.class));
    }

    @Test
    void cancelClosesWorkOrderAndJobCase() {
        JobCase jobCase = readyJobCase();
        jobCase.markInProduction();
        Quotation approved = approvedQuotation(jobCase);
        WorkOrder workOrder = workOrder(jobCase, approved);
        ReflectionTestUtils.setField(workOrder, "id", 7L);

        when(accessPolicy.requireProductionActor(10L)).thenReturn(productionUser);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(workOrderRepository.saveAndFlush(workOrder)).thenReturn(workOrder);
        when(documentService.listPinned(7L)).thenReturn(List.of());

        var response = service.cancel(
                10L,
                7L,
                new CancelWorkOrderRequest("Orden detenida por decisión operativa.")
        );

        assertEquals(WorkOrderStatus.CANCELLED, response.status());
        assertEquals(JobCaseStatus.CANCELLED, jobCase.getStatus());
        assertEquals("Orden detenida por decisión operativa.", response.cancellationReason());
    }

    @Test
    void cancelledWorkOrderClosesCaseAndPreventsReplacement() {
        JobCase jobCase = readyJobCase();
        jobCase.markInProduction();
        Quotation approved = approvedQuotation(jobCase);
        WorkOrder workOrder = workOrder(jobCase, approved);
        ReflectionTestUtils.setField(workOrder, "id", 7L);

        when(accessPolicy.requireProductionActor(10L)).thenReturn(productionUser);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(workOrderRepository.saveAndFlush(workOrder)).thenReturn(workOrder);
        when(documentService.listPinned(7L)).thenReturn(List.of());

        service.cancel(
                10L,
                7L,
                new CancelWorkOrderRequest("Cancelar definitivamente el trabajo.")
        );

        when(accessPolicy.requireCreationActor(10L)).thenReturn(productionUser);
        when(jobCaseRepository.findByIdForUpdate(3L)).thenReturn(Optional.of(jobCase));

        assertThrows(
                BusinessException.class,
                () -> service.create(10L, 3L, createRequest())
        );
        assertEquals(JobCaseStatus.CANCELLED, jobCase.getStatus());
        verify(referenceGenerator, never()).nextWorkOrderNumber();
    }

    @Test
    void cancelRejectsWorkOrderOutsideCreated() {
        JobCase jobCase = readyJobCase();
        jobCase.markInProduction();
        Quotation approved = approvedQuotation(jobCase);
        WorkOrder workOrder = workOrder(jobCase, approved);
        ReflectionTestUtils.setField(workOrder, "id", 7L);
        ReflectionTestUtils.setField(
                workOrder,
                "status",
                WorkOrderStatus.READY_FOR_PRODUCTION
        );

        when(accessPolicy.requireProductionActor(10L)).thenReturn(productionUser);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));

        assertThrows(
                BusinessException.class,
                () -> service.cancel(
                        10L,
                        7L,
                        new CancelWorkOrderRequest("Intento inválido.")
                )
        );

        verify(workOrderRepository, never()).saveAndFlush(workOrder);
    }

    private CreateWorkOrderRequest createRequest() {
        return new CreateWorkOrderRequest(
                WorkOrderPriority.NORMAL,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15)
        );
    }

    private WorkOrder workOrder(JobCase jobCase, Quotation approved) {
        return WorkOrder.create(
                jobCase,
                approved,
                "OT-00000001",
                WorkOrderPriority.NORMAL,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                approved.getEstimatedDeliveryDate(),
                productionUser
        );
    }

    private JobCase readyJobCase() {
        CustomerRequest request = CustomerRequest.submit(
                customer,
                "REQ-00000001",
                null,
                "Eje de transmisión",
                "Fabricar conforme al plano.",
                25,
                MaterialRequirementType.SPECIFIED,
                "AISI 4140",
                LocalDate.of(2026, 10, 30),
                requester
        );
        JobCase jobCase = JobCase.open(
                request,
                "CASE-00000003",
                Instant.parse("2026-09-20T18:00:00Z")
        );
        jobCase.takeForReview(commercialUser, Instant.parse("2026-09-20T19:00:00Z"));
        jobCase.markReadyForQuotation();
        ReflectionTestUtils.setField(jobCase, "id", 3L);
        return jobCase;
    }

    private Quotation approvedQuotation(JobCase jobCase) {
        Quotation quotation = Quotation.draft(jobCase, "QT-00000001", commercialUser);
        QuotationItem item = QuotationItem.create(
                quotation,
                1,
                "Fabricación de ejes",
                new BigDecimal("25.00"),
                new BigDecimal("100.00"),
                new BigDecimal("2500.00")
        );
        quotation.replaceDraftContent(
                "MXN",
                new BigDecimal("16.0000"),
                LocalDate.of(2026, 10, 10),
                LocalDate.of(2026, 10, 20),
                List.of(item),
                new BigDecimal("2500.00"),
                new BigDecimal("400.00"),
                new BigDecimal("2900.00")
        );
        quotation.send(Instant.parse("2026-09-21T18:00:00Z"));
        quotation.approve(Instant.parse("2026-09-22T18:00:00Z"));
        return quotation;
    }
}
