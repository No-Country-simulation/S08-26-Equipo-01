package com.nocountry.qualitytrack.nonconformities.dto.response;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityDisposition;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;

import java.time.Instant;

public record NonConformityResponse(
        Long id,
        String number,
        Long workOrderId,
        String workOrderNumber,
        WorkOrderStatus workOrderStatus,
        Long originalInspectionId,
        NonConformityStatus status,
        Integer affectedQuantity,
        String severity,
        String description,
        NonConformityDisposition disposition,
        Long openedByUserId,
        String openedByName,
        Instant openedAt,
        Long resolvedByUserId,
        String resolvedByName,
        Instant closedAt,
        String resolutionNotes,
        Instant createdAt,
        Instant updatedAt
) {

    public static NonConformityResponse from(NonConformity nonConformity) {
        return new NonConformityResponse(
                nonConformity.getId(),
                nonConformity.getNonConformityNumber(),
                nonConformity.getWorkOrder().getId(),
                nonConformity.getWorkOrder().getWorkOrderNumber(),
                nonConformity.getWorkOrder().getStatus(),
                nonConformity.getQualityInspection().getId(),
                nonConformity.getStatus(),
                nonConformity.getAffectedQuantity(),
                nonConformity.getSeverity(),
                nonConformity.getDescription(),
                nonConformity.getDisposition(),
                nonConformity.getOpenedByUser().getId(),
                fullName(nonConformity.getOpenedByUser()),
                nonConformity.getOpenedAt(),
                nonConformity.getResolvedByUser() == null
                        ? null
                        : nonConformity.getResolvedByUser().getId(),
                fullName(nonConformity.getResolvedByUser()),
                nonConformity.getClosedAt(),
                nonConformity.getResolutionNotes(),
                nonConformity.getCreatedAt(),
                nonConformity.getUpdatedAt()
        );
    }

    private static String fullName(User user) {
        if (user == null) {
            return null;
        }
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
