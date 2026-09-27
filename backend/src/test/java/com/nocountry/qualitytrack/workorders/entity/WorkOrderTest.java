package com.nocountry.qualitytrack.workorders.entity;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class WorkOrderTest {

    @Test
    void createStartsWorkOrderInCreatedWithPlanningData() {
        WorkOrder workOrder = newWorkOrder();

        assertEquals(WorkOrderStatus.CREATED, workOrder.getStatus());
        assertEquals("OT-00000001", workOrder.getWorkOrderNumber());
        assertEquals(WorkOrderPriority.NORMAL, workOrder.getPriority());
        assertEquals(20, workOrder.getPlannedQuantity());
        assertEquals(LocalDate.of(2026, 10, 1), workOrder.getPlannedStartDate());
        assertEquals(LocalDate.of(2026, 10, 15), workOrder.getPlannedEndDate());
        assertEquals(LocalDate.of(2026, 10, 20), workOrder.getAgreedDeliveryDate());
    }

    @Test
    void createRejectsNonPositivePlannedQuantity() {
        assertThrows(
                IllegalArgumentException.class,
                () -> WorkOrder.create(
                        mock(JobCase.class),
                        mock(Quotation.class),
                        "OT-00000001",
                        WorkOrderPriority.NORMAL,
                        0,
                        LocalDate.of(2026, 10, 1),
                        LocalDate.of(2026, 10, 15),
                        LocalDate.of(2026, 10, 20),
                        mock(User.class)
                )
        );
    }

    @Test
    void createRejectsEndDateOnOrAfterCommittedDelivery() {
        assertThrows(
                IllegalArgumentException.class,
                () -> WorkOrder.create(
                        mock(JobCase.class),
                        mock(Quotation.class),
                        "OT-00000001",
                        WorkOrderPriority.NORMAL,
                        20,
                        LocalDate.of(2026, 10, 1),
                        LocalDate.of(2026, 10, 20),
                        LocalDate.of(2026, 10, 20),
                        mock(User.class)
                )
        );
    }

    @Test
    void createdWorkOrderCanUpdatePlanning() {
        WorkOrder workOrder = newWorkOrder();

        workOrder.updatePlanning(
                WorkOrderPriority.HIGH,
                LocalDate.of(2026, 10, 3),
                LocalDate.of(2026, 10, 18)
        );

        assertEquals(WorkOrderPriority.HIGH, workOrder.getPriority());
        assertEquals(LocalDate.of(2026, 10, 3), workOrder.getPlannedStartDate());
        assertEquals(LocalDate.of(2026, 10, 18), workOrder.getPlannedEndDate());
    }

    @Test
    void updatePlanningRejectsEndDateOnCommittedDelivery() {
        WorkOrder workOrder = newWorkOrder();

        assertThrows(
                IllegalArgumentException.class,
                () -> workOrder.updatePlanning(
                        WorkOrderPriority.NORMAL,
                        LocalDate.of(2026, 10, 3),
                        LocalDate.of(2026, 10, 20)
                )
        );
    }

    @Test
    void releasedWorkOrderCannotUpdatePlanning() {
        WorkOrder workOrder = newWorkOrder();
        workOrder.releaseToProduction();

        assertThrows(
                IllegalStateException.class,
                () -> workOrder.updatePlanning(
                        WorkOrderPriority.HIGH,
                        LocalDate.of(2026, 10, 3),
                        LocalDate.of(2026, 10, 18)
                )
        );
    }

    @Test
    void releaseMovesCreatedWorkOrderToReadyForProduction() {
        WorkOrder workOrder = newWorkOrder();

        workOrder.releaseToProduction();

        assertEquals(WorkOrderStatus.READY_FOR_PRODUCTION, workOrder.getStatus());
    }

    @Test
    void releasedWorkOrderCannotBeReleasedAgain() {
        WorkOrder workOrder = newWorkOrder();
        workOrder.releaseToProduction();

        assertThrows(IllegalStateException.class, workOrder::releaseToProduction);
    }

    @Test
    void cancelMovesCreatedWorkOrderToCancelled() {
        User actor = mock(User.class);
        WorkOrder workOrder = WorkOrder.create(
                mock(JobCase.class),
                mock(Quotation.class),
                "OT-00000001",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                actor
        );
        Instant cancelledAt = Instant.parse("2026-09-26T18:00:00Z");

        workOrder.cancel(actor, "Capacidad de producción no disponible.", cancelledAt);

        assertEquals(WorkOrderStatus.CANCELLED, workOrder.getStatus());
        assertEquals("Capacidad de producción no disponible.", workOrder.getCancellationReason());
        assertEquals(cancelledAt, workOrder.getCancelledAt());
    }

    @Test
    void cancelledWorkOrderCannotBeCancelledAgain() {
        User actor = mock(User.class);
        WorkOrder workOrder = WorkOrder.create(
                mock(JobCase.class),
                mock(Quotation.class),
                "OT-00000001",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                actor
        );
        workOrder.cancel(actor, null, Instant.now());

        assertThrows(IllegalStateException.class, () -> workOrder.cancel(actor, null, Instant.now()));
    }

    private WorkOrder newWorkOrder() {
        return WorkOrder.create(
                mock(JobCase.class),
                mock(Quotation.class),
                "OT-00000001",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                mock(User.class)
        );
    }
}
