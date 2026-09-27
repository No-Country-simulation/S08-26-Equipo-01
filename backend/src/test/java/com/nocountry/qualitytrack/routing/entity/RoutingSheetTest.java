package com.nocountry.qualitytrack.routing.entity;

import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.enums.RoutingSheetStatus;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RoutingSheetTest {

    private WorkOrder workOrder;
    private User actor;

    @BeforeEach
    void setUp() {
        workOrder = mock(WorkOrder.class);
        actor = mock(User.class);
        when(workOrder.getStatus()).thenReturn(WorkOrderStatus.CREATED);
    }

    @Test
    void productionRoutingStartsAsRevisionOneDraft() {
        RoutingSheet routingSheet = RoutingSheet.createProduction(workOrder, actor);

        assertEquals(1, routingSheet.getRevision());
        assertEquals(RoutingPurpose.PRODUCTION, routingSheet.getPurpose());
        assertEquals(RoutingSheetStatus.DRAFT, routingSheet.getStatus());
        assertEquals(0, routingSheet.getOperations().size());
    }

    @Test
    void draftAllowsOrderedOperationsAndCalculatesTotalEstimate() {
        RoutingSheet routingSheet = RoutingSheet.createProduction(workOrder, actor);

        routingSheet.addOperation(10, "cut", "Corte", "Preparar barra.", 30);
        routingSheet.addOperation(20, "TURN-CNC", "Torneado", "Mecanizar según plano.", 180);

        assertEquals(2, routingSheet.getOperations().size());
        assertEquals("CUT", routingSheet.getOperations().get(0).getCode());
        assertEquals(210, routingSheet.totalEstimatedMinutes());
    }

    @Test
    void draftRejectsDuplicateSequence() {
        RoutingSheet routingSheet = RoutingSheet.createProduction(workOrder, actor);
        routingSheet.addOperation(10, "CUT", "Corte", null, 30);

        assertThrows(
                IllegalArgumentException.class,
                () -> routingSheet.addOperation(10, "TURN", "Torneado", null, 45)
        );
    }

    @Test
    void approveRequiresAtLeastOneOperation() {
        RoutingSheet routingSheet = RoutingSheet.createProduction(workOrder, actor);

        assertThrows(
                IllegalStateException.class,
                () -> routingSheet.approve(actor, Instant.now())
        );
    }

    @Test
    void approvedRoutingIsImmutable() {
        RoutingSheet routingSheet = RoutingSheet.createProduction(workOrder, actor);
        RoutingOperation operation = routingSheet.addOperation(
                10,
                "CUT",
                "Corte",
                null,
                30
        );
        ReflectionTestUtils.setField(operation, "id", 100L);

        routingSheet.approve(actor, Instant.parse("2026-09-27T10:00:00Z"));

        assertEquals(RoutingSheetStatus.APPROVED, routingSheet.getStatus());
        assertThrows(
                IllegalStateException.class,
                () -> routingSheet.updateOperation(
                        100L,
                        20,
                        "CUT",
                        "Corte actualizado",
                        null,
                        35
                )
        );
        assertThrows(
                IllegalStateException.class,
                () -> routingSheet.removeOperation(100L)
        );
    }

    @Test
    void approvedRoutingCanBeReopenedForCorrections() {
        RoutingSheet routingSheet = RoutingSheet.createProduction(workOrder, actor);
        routingSheet.addOperation(10, "CUT", "Corte", null, 30);
        routingSheet.approve(actor, Instant.parse("2026-09-27T10:00:00Z"));

        routingSheet.reopen();

        assertEquals(RoutingSheetStatus.DRAFT, routingSheet.getStatus());
        assertEquals(null, routingSheet.getApprovedByUser());
        assertEquals(null, routingSheet.getApprovedAt());
    }

    @Test
    void releasedRoutingCannotBeReopened() {
        RoutingSheet routingSheet = RoutingSheet.createProduction(workOrder, actor);
        routingSheet.addOperation(10, "CUT", "Corte", null, 30);
        routingSheet.approve(actor, Instant.parse("2026-09-27T10:00:00Z"));
        routingSheet.release(actor, Instant.parse("2026-09-27T11:00:00Z"));

        assertThrows(IllegalStateException.class, routingSheet::reopen);
    }

    @Test
    void approvedRoutingCanBeReleased() {
        RoutingSheet routingSheet = RoutingSheet.createProduction(workOrder, actor);
        routingSheet.addOperation(10, "CUT", "Corte", null, 30);
        routingSheet.approve(actor, Instant.parse("2026-09-27T10:00:00Z"));

        routingSheet.release(actor, Instant.parse("2026-09-27T11:00:00Z"));

        assertEquals(RoutingSheetStatus.RELEASED, routingSheet.getStatus());
        assertEquals(Instant.parse("2026-09-27T11:00:00Z"), routingSheet.getReleasedAt());
    }
}
