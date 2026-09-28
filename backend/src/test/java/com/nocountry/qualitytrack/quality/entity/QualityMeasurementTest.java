package com.nocountry.qualitytrack.quality.entity;

import com.nocountry.qualitytrack.quality.enums.QualityMeasurementResult;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class QualityMeasurementTest {

    @Test
    void calculatesPassInsideNumericLimits() {
        QualityInspection inspection = startedInspection();

        QualityMeasurement measurement = QualityMeasurement.create(
                inspection,
                "Diámetro exterior",
                new BigDecimal("25.000"),
                new BigDecimal("24.950"),
                new BigDecimal("25.050"),
                new BigDecimal("25.020"),
                "mm",
                null
        );

        assertEquals(QualityMeasurementResult.PASS, measurement.getResult());
    }

    @Test
    void calculatesFailOutsideNumericLimits() {
        QualityInspection inspection = startedInspection();

        QualityMeasurement measurement = QualityMeasurement.create(
                inspection,
                "Diámetro exterior",
                new BigDecimal("25.000"),
                new BigDecimal("24.950"),
                new BigDecimal("25.050"),
                new BigDecimal("25.070"),
                "mm",
                null
        );

        assertEquals(QualityMeasurementResult.FAIL, measurement.getResult());
    }

    @Test
    void rejectsInvalidRange() {
        QualityInspection inspection = startedInspection();

        assertThrows(
                IllegalArgumentException.class,
                () -> QualityMeasurement.create(
                        inspection,
                        "Diámetro",
                        new BigDecimal("25.000"),
                        new BigDecimal("25.100"),
                        new BigDecimal("25.050"),
                        new BigDecimal("25.060"),
                        "mm",
                        null
                )
        );
    }

    private QualityInspection startedInspection() {
        User inspector = mock(User.class);
        WorkOrder workOrder = WorkOrder.create(
                mock(JobCase.class),
                mock(Quotation.class),
                "OT-00000001",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                inspector
        );
        workOrder.releaseToProduction();
        workOrder.startProduction(Instant.parse("2026-09-28T08:00:00Z"));
        workOrder.markProductionCompleted(Instant.parse("2026-09-28T16:00:00Z"));

        QualityInspection inspection = QualityInspection.createPending(workOrder);
        workOrder.sendToQuality();
        inspection.start(inspector, Instant.parse("2026-09-28T17:00:00Z"));
        return inspection;
    }
}
