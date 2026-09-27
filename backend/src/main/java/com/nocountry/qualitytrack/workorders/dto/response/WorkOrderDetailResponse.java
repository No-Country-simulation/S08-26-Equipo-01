package com.nocountry.qualitytrack.workorders.dto.response;

import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record WorkOrderDetailResponse(
        Long id,
        String workOrderNumber,
        WorkOrderStatus status,
        WorkOrderPriority priority,
        LocalDate plannedStartDate,
        LocalDate plannedEndDate,
        LocalDate agreedDeliveryDate,
        Long createdByUserId,
        String createdByName,
        Long cancelledByUserId,
        String cancelledByName,
        Instant cancelledAt,
        String cancellationReason,
        Instant createdAt,
        Instant updatedAt,
        WorkOrderSourceResponse source,
        WorkOrderAgreementResponse agreement,
        List<WorkOrderDocumentResponse> pinnedDocuments
) {
    public static WorkOrderDetailResponse from(
            WorkOrder workOrder,
            WorkOrderSourceResponse source,
            List<WorkOrderDocumentResponse> pinnedDocuments
    ) {
        return new WorkOrderDetailResponse(
                workOrder.getId(),
                workOrder.getWorkOrderNumber(),
                workOrder.getStatus(),
                workOrder.getPriority(),
                workOrder.getPlannedStartDate(),
                workOrder.getPlannedEndDate(),
                workOrder.getAgreedDeliveryDate(),
                workOrder.getCreatedByUser().getId(),
                fullName(workOrder.getCreatedByUser()),
                workOrder.getCancelledByUser() == null ? null : workOrder.getCancelledByUser().getId(),
                workOrder.getCancelledByUser() == null ? null : fullName(workOrder.getCancelledByUser()),
                workOrder.getCancelledAt(),
                workOrder.getCancellationReason(),
                workOrder.getCreatedAt(),
                workOrder.getUpdatedAt(),
                source,
                WorkOrderAgreementResponse.from(workOrder.getApprovedQuotation()),
                pinnedDocuments == null ? List.of() : List.copyOf(pinnedDocuments)
        );
    }

    private static String fullName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
