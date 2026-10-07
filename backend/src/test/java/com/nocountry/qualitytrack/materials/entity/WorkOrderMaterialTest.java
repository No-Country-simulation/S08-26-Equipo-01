package com.nocountry.qualitytrack.materials.entity;

import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class WorkOrderMaterialTest {

    @Test
    void repeatedConsumptionAggregatesOnSameWorkOrderLotLink() {
        WorkOrderMaterial consumption = WorkOrderMaterial.create(
                mock(WorkOrder.class),
                mock(MaterialLot.class),
                new BigDecimal("10.500"),
                mock(User.class),
                Instant.parse("2026-09-28T08:00:00Z")
        );

        consumption.addQuantity(
                new BigDecimal("2.250"),
                mock(User.class),
                Instant.parse("2026-09-28T09:00:00Z")
        );

        assertEquals(new BigDecimal("12.750"), consumption.getQuantityUsed());
    }

    @Test
    void consumptionRejectsNonPositiveQuantities() {
        assertThrows(
                IllegalArgumentException.class,
                () -> WorkOrderMaterial.create(
                        mock(WorkOrder.class),
                        mock(MaterialLot.class),
                        BigDecimal.ZERO,
                        mock(User.class),
                        Instant.now()
                )
        );
    }
}
