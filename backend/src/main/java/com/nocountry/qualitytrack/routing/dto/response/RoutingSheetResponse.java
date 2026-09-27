package com.nocountry.qualitytrack.routing.dto.response;

import com.nocountry.qualitytrack.routing.entity.RoutingOperation;
import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.enums.RoutingSheetStatus;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record RoutingSheetResponse(
        Long id,
        Long workOrderId,
        String workOrderNumber,
        WorkOrderStatus workOrderStatus,
        Integer revision,
        RoutingPurpose purpose,
        RoutingSheetStatus status,
        Integer totalEstimatedMinutes,
        List<RoutingOperationResponse> operations,
        Long createdByUserId,
        String createdByName,
        Long approvedByUserId,
        String approvedByName,
        Instant approvedAt,
        Long releasedByUserId,
        String releasedByName,
        Instant releasedAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static RoutingSheetResponse from(RoutingSheet routingSheet) {
        List<RoutingOperationResponse> operations = routingSheet.getOperations()
                .stream()
                .sorted(Comparator.comparing(RoutingOperation::getSequenceNumber))
                .map(RoutingOperationResponse::from)
                .toList();

        return new RoutingSheetResponse(
                routingSheet.getId(),
                routingSheet.getWorkOrder().getId(),
                routingSheet.getWorkOrder().getWorkOrderNumber(),
                routingSheet.getWorkOrder().getStatus(),
                routingSheet.getRevision(),
                routingSheet.getPurpose(),
                routingSheet.getStatus(),
                routingSheet.totalEstimatedMinutes(),
                operations,
                routingSheet.getCreatedByUser().getId(),
                fullName(routingSheet.getCreatedByUser()),
                routingSheet.getApprovedByUser() == null
                        ? null
                        : routingSheet.getApprovedByUser().getId(),
                fullName(routingSheet.getApprovedByUser()),
                routingSheet.getApprovedAt(),
                routingSheet.getReleasedByUser() == null
                        ? null
                        : routingSheet.getReleasedByUser().getId(),
                fullName(routingSheet.getReleasedByUser()),
                routingSheet.getReleasedAt(),
                routingSheet.getCreatedAt(),
                routingSheet.getUpdatedAt()
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
