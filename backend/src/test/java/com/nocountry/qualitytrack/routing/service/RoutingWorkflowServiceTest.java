package com.nocountry.qualitytrack.routing.service;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.routing.dto.request.ReopenRoutingSheetRequest;
import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.routing.enums.RoutingSheetStatus;
import com.nocountry.qualitytrack.routing.repository.RoutingSheetRepository;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderDocumentRepository;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoutingWorkflowServiceTest {

    @Mock private RoutingSheetRepository routingSheetRepository;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private WorkOrderDocumentRepository documentRepository;
    @Mock private RoutingAccessPolicy accessPolicy;
    @Mock private TraceabilityService traceabilityService;
    @Mock private JobCase jobCase;
    @Mock private Quotation quotation;
    @Mock private User actor;

    private RoutingWorkflowService service;
    private WorkOrder workOrder;
    private RoutingSheet routingSheet;

    @BeforeEach
    void setUp() {
        service = new RoutingWorkflowService(
                routingSheetRepository,
                workOrderRepository,
                documentRepository,
                accessPolicy,
                traceabilityService
        );

        lenient().when(actor.getId()).thenReturn(10L);

        workOrder = WorkOrder.create(
                jobCase,
                quotation,
                "OT-00126",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 9, 10),
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 2),
                actor
        );
        ReflectionTestUtils.setField(workOrder, "id", 7L);

        routingSheet = RoutingSheet.createProduction(workOrder, actor);
        routingSheet.addOperation(
                10,
                "CUT",
                "Corte de material",
                "Preparar barra según longitud de proceso.",
                30
        );
        ReflectionTestUtils.setField(routingSheet, "id", 20L);
    }

    @Test
    void approveFreezesValidDraft() {
        stubLockedRouting();
        when(accessPolicy.requireDesignerActor(10L)).thenReturn(actor);
        when(documentRepository.existsByWorkOrder_Id(7L)).thenReturn(true);
        when(routingSheetRepository.saveAndFlush(routingSheet)).thenReturn(routingSheet);

        var response = service.approve(10L, 20L);

        assertEquals(RoutingSheetStatus.APPROVED, response.status());
        assertEquals(WorkOrderStatus.CREATED, response.workOrderStatus());
        verify(traceabilityService).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void approveRejectsMissingPinnedDocuments() {
        stubLockedRouting();
        when(accessPolicy.requireDesignerActor(10L)).thenReturn(actor);
        when(documentRepository.existsByWorkOrder_Id(7L)).thenReturn(false);

        assertThrows(
                BusinessException.class,
                () -> service.approve(10L, 20L)
        );
    }

    @Test
    void reopenReturnsApprovedRoutingToDraft() {
        routingSheet.approve(actor, Instant.parse("2026-09-27T10:00:00Z"));
        stubLockedRouting();
        when(accessPolicy.requireDesignerActor(10L)).thenReturn(actor);
        when(routingSheetRepository.saveAndFlush(routingSheet)).thenReturn(routingSheet);

        var response = service.reopen(
                10L,
                20L,
                new ReopenRoutingSheetRequest("Corregir tiempo estimado de torneado.")
        );

        assertEquals(RoutingSheetStatus.DRAFT, response.status());
        assertEquals(WorkOrderStatus.CREATED, response.workOrderStatus());
        verify(traceabilityService).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void releasedRoutingCannotBeReopened() {
        routingSheet.approve(actor, Instant.parse("2026-09-27T10:00:00Z"));
        routingSheet.release(actor, Instant.parse("2026-09-27T11:00:00Z"));
        stubLockedRouting();
        when(accessPolicy.requireDesignerActor(10L)).thenReturn(actor);

        assertThrows(
                BusinessException.class,
                () -> service.reopen(
                        10L,
                        20L,
                        new ReopenRoutingSheetRequest("No debe permitirse.")
                )
        );
    }

    @Test
    void releaseMovesRoutingAndWorkOrderAtomically() {
        routingSheet.approve(actor, Instant.parse("2026-09-27T10:00:00Z"));
        stubLockedRouting();
        when(accessPolicy.requireDesignerActor(10L)).thenReturn(actor);
        when(documentRepository.existsByWorkOrder_Id(7L)).thenReturn(true);
        when(routingSheetRepository.saveAndFlush(routingSheet)).thenReturn(routingSheet);

        var response = service.release(10L, 20L);

        assertEquals(RoutingSheetStatus.RELEASED, response.status());
        assertEquals(WorkOrderStatus.READY_FOR_PRODUCTION, response.workOrderStatus());
        assertEquals(WorkOrderStatus.READY_FOR_PRODUCTION, workOrder.getStatus());
        verify(traceabilityService, times(2)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void releaseRequiresApprovedRouting() {
        stubLockedRouting();
        when(accessPolicy.requireDesignerActor(10L)).thenReturn(actor);

        assertThrows(
                BusinessException.class,
                () -> service.release(10L, 20L)
        );
    }

    private void stubLockedRouting() {
        when(routingSheetRepository.findWorkOrderIdById(20L)).thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(routingSheetRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(routingSheet));
    }
}
