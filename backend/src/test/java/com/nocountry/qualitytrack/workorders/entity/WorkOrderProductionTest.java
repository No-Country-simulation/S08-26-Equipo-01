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

class WorkOrderProductionTest {

    @Test
    void firstExecutionCanMoveReleasedOrderToInProduction() {
        WorkOrder workOrder = releasedWorkOrder();
        Instant startedAt = Instant.parse("2026-09-28T08:00:00Z");

        workOrder.startProduction(startedAt);

        assertEquals(WorkOrderStatus.IN_PRODUCTION, workOrder.getStatus());
        assertEquals(startedAt, workOrder.getActualStartAt());
    }

    @Test
    void productionCompletionStoresActualEndWithoutSendingToQuality() {
        WorkOrder workOrder = releasedWorkOrder();
        Instant startedAt = Instant.parse("2026-09-28T08:00:00Z");
        Instant completedAt = Instant.parse("2026-09-28T16:00:00Z");

        workOrder.startProduction(startedAt);
        workOrder.markProductionCompleted(completedAt);

        assertEquals(WorkOrderStatus.IN_PRODUCTION, workOrder.getStatus());
        assertEquals(completedAt, workOrder.getActualEndAt());
        assertEquals(true, workOrder.isProductionCompleted());
    }

    @Test
    void productionCannotFinishBeforeItStarts() {
        WorkOrder workOrder = releasedWorkOrder();

        assertThrows(
                IllegalStateException.class,
                () -> workOrder.markProductionCompleted(Instant.now())
        );
    }

    @Test
    void actualEndCannotBeBeforeActualStart() {
        WorkOrder workOrder = releasedWorkOrder();
        workOrder.startProduction(Instant.parse("2026-09-28T10:00:00Z"));

        assertThrows(
                IllegalArgumentException.class,
                () -> workOrder.markProductionCompleted(
                        Instant.parse("2026-09-28T09:00:00Z")
                )
        );
    }

    private WorkOrder releasedWorkOrder() {
        WorkOrder workOrder = WorkOrder.create(
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
        workOrder.releaseToProduction();
        return workOrder;
    }
}
