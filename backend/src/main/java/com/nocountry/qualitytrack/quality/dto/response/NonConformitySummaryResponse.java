package com.nocountry.qualitytrack.quality.dto.response;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityDisposition;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;

import java.time.Instant;

public record NonConformitySummaryResponse(
        Long id,
        String number,
        NonConformityStatus status,
        Integer affectedQuantity,
        String severity,
        String description,
        NonConformityDisposition disposition,
        Instant openedAt,
        Instant closedAt
) {

    public static NonConformitySummaryResponse from(NonConformity nonConformity) {
        if (nonConformity == null) {
            return null;
        }
        return new NonConformitySummaryResponse(
                nonConformity.getId(),
                nonConformity.getNonConformityNumber(),
                nonConformity.getStatus(),
                nonConformity.getAffectedQuantity(),
                nonConformity.getSeverity(),
                nonConformity.getDescription(),
                nonConformity.getDisposition(),
                nonConformity.getOpenedAt(),
                nonConformity.getClosedAt()
        );
    }
}
