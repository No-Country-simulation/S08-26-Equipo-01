package com.nocountry.qualitytrack.quality.dto.response;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.quality.entity.QualityInspection;
import com.nocountry.qualitytrack.quality.entity.QualityMeasurement;
import com.nocountry.qualitytrack.quality.enums.QualityInspectionStatus;
import com.nocountry.qualitytrack.users.entity.User;

import java.time.Instant;
import java.util.List;

public record QualityInspectionResponse(
        Long id,
        Long workOrderId,
        String workOrderNumber,
        QualityInspectionStatus status,
        Long reworkNonConformityId,
        Long inspectorId,
        String inspectorName,
        Instant startedAt,
        Instant completedAt,
        List<QualityMeasurementResponse> measurements,
        NonConformitySummaryResponse nonConformity,
        Instant createdAt,
        Instant updatedAt
) {

    public static QualityInspectionResponse from(
            QualityInspection inspection,
            List<QualityMeasurement> measurements,
            NonConformity nonConformity
    ) {
        User inspector = inspection.getInspector();

        return new QualityInspectionResponse(
                inspection.getId(),
                inspection.getWorkOrder().getId(),
                inspection.getWorkOrder().getWorkOrderNumber(),
                inspection.getStatus(),
                inspection.getReworkNonConformity() == null
                        ? null
                        : inspection.getReworkNonConformity().getId(),
                inspector == null ? null : inspector.getId(),
                inspector == null
                        ? null
                        : (inspector.getFirstName() + " " + inspector.getLastName()).trim(),
                inspection.getStartedAt(),
                inspection.getCompletedAt(),
                measurements.stream()
                        .map(QualityMeasurementResponse::from)
                        .toList(),
                NonConformitySummaryResponse.from(nonConformity),
                inspection.getCreatedAt(),
                inspection.getUpdatedAt()
        );
    }
}
