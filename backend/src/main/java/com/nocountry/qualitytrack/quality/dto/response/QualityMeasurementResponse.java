package com.nocountry.qualitytrack.quality.dto.response;

import com.nocountry.qualitytrack.quality.entity.QualityMeasurement;
import com.nocountry.qualitytrack.quality.enums.QualityMeasurementResult;

import java.math.BigDecimal;
import java.time.Instant;

public record QualityMeasurementResponse(
        Long id,
        String characteristic,
        BigDecimal nominalValue,
        BigDecimal lowerLimit,
        BigDecimal upperLimit,
        BigDecimal measuredValue,
        String unit,
        QualityMeasurementResult result,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {

    public static QualityMeasurementResponse from(QualityMeasurement measurement) {
        return new QualityMeasurementResponse(
                measurement.getId(),
                measurement.getCharacteristic(),
                measurement.getNominalValue(),
                measurement.getLowerLimit(),
                measurement.getUpperLimit(),
                measurement.getMeasuredValue(),
                measurement.getUnit(),
                measurement.getResult(),
                measurement.getNotes(),
                measurement.getCreatedAt(),
                measurement.getUpdatedAt()
        );
    }
}
