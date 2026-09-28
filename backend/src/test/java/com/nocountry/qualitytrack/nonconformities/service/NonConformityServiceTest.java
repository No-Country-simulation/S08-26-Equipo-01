package com.nocountry.qualitytrack.nonconformities.service;

import com.nocountry.qualitytrack.nonconformities.dto.request.AuthorizeUseAsIsRequest;
import com.nocountry.qualitytrack.nonconformities.dto.request.UpdateNonConformityRequest;
import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityDisposition;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.nonconformities.repository.NonConformityRepository;
import com.nocountry.qualitytrack.production.entity.OperationExecution;
import com.nocountry.qualitytrack.production.enums.OperationExecutionStatus;
import com.nocountry.qualitytrack.production.repository.OperationExecutionRepository;
import com.nocountry.qualitytrack.quality.entity.QualityInspection;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.routing.entity.RoutingOperation;
import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.repository.RoutingSheetRepository;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
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

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NonConformityServiceTest {

    @Mock private NonConformityAccessPolicy accessPolicy;
    @Mock private NonConformityRepository nonConformityRepository;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private RoutingSheetRepository routingSheetRepository;
    @Mock private OperationExecutionRepository executionRepository;
    @Mock private TraceabilityService traceabilityService;
    @Mock private JobCase jobCase;
    @Mock private Quotation quotation;
    @Mock private User actor;

    private NonConformityService service;
    private WorkOrder workOrder;
    private QualityInspection rejectedInspection;
    private NonConformity nonConformity;

    @BeforeEach
    void setUp() {
        service = new NonConformityService(
                accessPolicy,
                nonConformityRepository,
                workOrderRepository,
                routingSheetRepository,
                executionRepository,
                traceabilityService
        );

        lenient().when(actor.getId()).thenReturn(10L);

        workOrder = WorkOrder.create(
                jobCase,
                quotation,
                "OT-00000002",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                actor
        );
        ReflectionTestUtils.setField(workOrder, "id", 7L);

        workOrder.releaseToProduction();
        workOrder.startProduction(Instant.parse("2026-09-27T08:00:00Z"));
        workOrder.markProductionCompleted(Instant.parse("2026-09-27T16:00:00Z"));

        rejectedInspection = QualityInspection.createPending(workOrder);
        ReflectionTestUtils.setField(rejectedInspection, "id", 100L);
        workOrder.sendToQuality();
        rejectedInspection.start(actor, Instant.parse("2026-09-27T17:00:00Z"));
        rejectedInspection.reject(Instant.parse("2026-09-27T17:30:00Z"));
        workOrder.holdForQuality();

        nonConformity = NonConformity.open(
                "NC-0001",
                workOrder,
                rejectedInspection,
                actor,
                Instant.parse("2026-09-27T17:30:00Z")
        );
        ReflectionTestUtils.setField(nonConformity, "id", 300L);
    }

    @Test
    void qualityCanRegisterAffectedQuantitySeverityAndDescription() {
        stubLockedNonConformity();
        when(accessPolicy.requireQualityActor(10L)).thenReturn(actor);
        when(nonConformityRepository.saveAndFlush(nonConformity))
                .thenReturn(nonConformity);

        var response = service.updateDetails(
                10L,
                300L,
                new UpdateNonConformityRequest(
                        2,
                        "MAJOR",
                        "Dos piezas presentan diámetro fuera de tolerancia."
                )
        );

        assertEquals(2, response.affectedQuantity());
        assertEquals("MAJOR", response.severity());
        assertEquals(
                "Dos piezas presentan diámetro fuera de tolerancia.",
                response.description()
        );
        assertEquals(NonConformityStatus.OPEN, response.status());
        assertNull(response.disposition());
        verify(traceabilityService).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void engineeringCreatesNewReworkRevisionLinkedToNonConformity() {
        completeDetails();
        stubLockedNonConformity();

        when(accessPolicy.requireEngineeringActor(10L)).thenReturn(actor);
        when(routingSheetRepository
                .findAllByNonConformity_IdOrderByRevisionAsc(300L))
                .thenReturn(List.of());
        when(routingSheetRepository.findMaxRevisionByWorkOrderId(7L))
                .thenReturn(1);
        when(routingSheetRepository.saveAndFlush(any(RoutingSheet.class)))
                .thenAnswer(invocation -> {
                    RoutingSheet route = invocation.getArgument(0);
                    ReflectionTestUtils.setField(route, "id", 500L);
                    return route;
                });

        var response = service.createReworkRouting(10L, 300L);

        assertEquals(2, response.revision());
        assertEquals(RoutingPurpose.REWORK, response.purpose());
        assertEquals(300L, response.nonConformityId());
        assertEquals(NonConformityDisposition.REWORK, nonConformity.getDisposition());
        assertEquals(WorkOrderStatus.QUALITY_HOLD, workOrder.getStatus());
        verify(traceabilityService, times(2)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void useAsIsRequiresAdminAndClosesNonConformity() {
        completeDetails();
        stubLockedNonConformity();

        when(accessPolicy.requireAdminActor(10L)).thenReturn(actor);
        when(nonConformityRepository.saveAndFlush(nonConformity))
                .thenReturn(nonConformity);

        var response = service.authorizeUseAsIs(
                10L,
                300L,
                new AuthorizeUseAsIsRequest(
                        "Concesión autorizada para uso funcional."
                )
        );

        assertEquals(NonConformityDisposition.USE_AS_IS, response.disposition());
        assertEquals(NonConformityStatus.CLOSED, response.status());
        assertEquals(10L, response.resolvedByUserId());
        assertEquals(WorkOrderStatus.READY_FOR_DELIVERY, workOrder.getStatus());
        verify(traceabilityService, times(3)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void scrapKeepsOrderOnHoldWhenCommittedQuantityWouldBeShort() {
        completeDetails();
        stubLockedNonConformity();

        RoutingSheet productionRoute = productionRoute();
        OperationExecution terminalExecution = completedExecution(
                productionRoute.getOperations().get(0),
                20
        );

        when(accessPolicy.requireResolutionActor(10L)).thenReturn(actor);
        when(routingSheetRepository.findByWorkOrder_IdAndPurpose(
                7L,
                RoutingPurpose.PRODUCTION
        )).thenReturn(Optional.of(productionRoute));
        when(executionRepository
                .findFirstByRoutingOperation_IdAndStatusOrderByAttemptNumberDesc(
                        401L,
                        OperationExecutionStatus.COMPLETED
                )).thenReturn(Optional.of(terminalExecution));
        when(nonConformityRepository.saveAndFlush(nonConformity))
                .thenReturn(nonConformity);

        var response = service.recordScrap(10L, 300L);

        assertEquals(18, response.remainingAcceptedQuantity());
        assertEquals(false, response.readyForDelivery());
        assertEquals(NonConformityDisposition.SCRAP, nonConformity.getDisposition());
        assertEquals(NonConformityStatus.OPEN, nonConformity.getStatus());
        assertEquals(WorkOrderStatus.QUALITY_HOLD, workOrder.getStatus());
        assertNull(nonConformity.getClosedAt());
    }

    @Test
    void scrapClosesNonConformityWhenRemainingQuantityStillCoversPlan() {
        completeDetails();
        stubLockedNonConformity();

        RoutingSheet productionRoute = productionRoute();
        OperationExecution terminalExecution = completedExecution(
                productionRoute.getOperations().get(0),
                22
        );

        when(accessPolicy.requireResolutionActor(10L)).thenReturn(actor);
        when(routingSheetRepository.findByWorkOrder_IdAndPurpose(
                7L,
                RoutingPurpose.PRODUCTION
        )).thenReturn(Optional.of(productionRoute));
        when(executionRepository
                .findFirstByRoutingOperation_IdAndStatusOrderByAttemptNumberDesc(
                        401L,
                        OperationExecutionStatus.COMPLETED
                )).thenReturn(Optional.of(terminalExecution));
        when(nonConformityRepository.saveAndFlush(nonConformity))
                .thenReturn(nonConformity);

        var response = service.recordScrap(10L, 300L);

        assertEquals(20, response.remainingAcceptedQuantity());
        assertEquals(true, response.readyForDelivery());
        assertEquals(NonConformityStatus.CLOSED, nonConformity.getStatus());
        assertNotNull(nonConformity.getClosedAt());
        assertEquals(WorkOrderStatus.READY_FOR_DELIVERY, workOrder.getStatus());
        verify(traceabilityService, times(3)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    private void completeDetails() {
        nonConformity.updateDetails(
                2,
                "MAJOR",
                "Dos piezas presentan diámetro fuera de tolerancia."
        );
    }

    private void stubLockedNonConformity() {
        when(nonConformityRepository.findWorkOrderIdById(300L))
                .thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L))
                .thenReturn(Optional.of(workOrder));
        when(nonConformityRepository.findByIdForUpdate(300L))
                .thenReturn(Optional.of(nonConformity));
    }

    private RoutingSheet productionRoute() {
        WorkOrder productionOrder = WorkOrder.create(
                jobCase,
                quotation,
                "OT-PROD-AUX",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                actor
        );
        ReflectionTestUtils.setField(productionOrder, "id", 7L);

        RoutingSheet route = RoutingSheet.createProduction(
                productionOrder,
                actor
        );
        RoutingOperation operation = route.addOperation(
                10,
                "FINAL",
                "Operación final",
                "Operación terminal de producción.",
                30
        );
        ReflectionTestUtils.setField(route, "id", 400L);
        ReflectionTestUtils.setField(operation, "id", 401L);

        route.approve(actor, Instant.parse("2026-09-27T10:00:00Z"));
        route.release(actor, Instant.parse("2026-09-27T11:00:00Z"));

        return route;
    }

    private OperationExecution completedExecution(
            RoutingOperation operation,
            int accepted
    ) {
        OperationExecution execution = OperationExecution.start(
                operation,
                actor,
                null,
                1,
                null,
                Instant.parse("2026-09-27T12:00:00Z")
        );
        execution.complete(
                accepted,
                accepted,
                0,
                null,
                Instant.parse("2026-09-27T13:00:00Z")
        );
        return execution;
    }
}
