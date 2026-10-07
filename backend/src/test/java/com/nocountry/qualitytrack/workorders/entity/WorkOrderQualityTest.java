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

class WorkOrderQualityTest {

    @Test
    void completedProductionCanBeSentToQuality() {
        WorkOrder workOrder = completedProductionOrder();

        workOrder.sendToQuality();

        assertEquals(WorkOrderStatus.QUALITY_PENDING, workOrder.getStatus());
    }

    @Test
    void incompleteProductionCannotBeSentToQuality() {
        WorkOrder workOrder = releasedOrder();
        workOrder.startProduction(Instant.parse("2026-09-28T08:00:00Z"));

        assertThrows(IllegalStateException.class, workOrder::sendToQuality);
    }

    @Test
    void approvedInspectionMakesOrderReadyForDelivery() {
        WorkOrder workOrder = completedProductionOrder();
        workOrder.sendToQuality();

        workOrder.approveQuality();

        assertEquals(WorkOrderStatus.READY_FOR_DELIVERY, workOrder.getStatus());
    }

    @Test
    void rejectedInspectionPlacesOrderOnQualityHold() {
        WorkOrder workOrder = completedProductionOrder();
        workOrder.sendToQuality();

        workOrder.holdForQuality();

        assertEquals(WorkOrderStatus.QUALITY_HOLD, workOrder.getStatus());
    }

    private WorkOrder completedProductionOrder() {
        WorkOrder workOrder = releasedOrder();
        workOrder.startProduction(Instant.parse("2026-09-28T08:00:00Z"));
        workOrder.markProductionCompleted(Instant.parse("2026-09-28T16:00:00Z"));
        return workOrder;
    }

    private WorkOrder releasedOrder() {
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
