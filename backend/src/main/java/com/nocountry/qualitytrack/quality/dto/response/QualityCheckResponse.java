package com.nocountry.qualitytrack.quality.dto.response;

import com.nocountry.qualitytrack.quality.entity.QualityCheck;
import com.nocountry.qualitytrack.quality.enums.QualityCheckResult;
import com.nocountry.qualitytrack.quality.enums.QualityCheckType;

import java.math.BigDecimal;
import java.time.Instant;

public record QualityCheckResponse(
        Long id,
        QualityCheckType type,
        String name,
        BigDecimal nominalValue,
        BigDecimal lowerLimit,
        BigDecimal upperLimit,
        BigDecimal measuredValue,
        String unit,
        QualityCheckResult result,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {

    public static QualityCheckResponse from(QualityCheck check) {
        return new QualityCheckResponse(
                check.getId(),
                check.getType(),
                check.getName(),
                check.getNominalValue(),
                check.getLowerLimit(),
                check.getUpperLimit(),
                check.getMeasuredValue(),
                check.getUnit(),
                check.getResult(),
                check.getNotes(),
                check.getCreatedAt(),
                check.getUpdatedAt()
        );
    }
}
