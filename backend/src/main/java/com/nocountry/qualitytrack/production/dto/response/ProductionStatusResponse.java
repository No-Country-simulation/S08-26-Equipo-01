package com.nocountry.qualitytrack.production.dto.response;

import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;

import java.time.Instant;
import java.util.List;

public record ProductionStatusResponse(
        Long workOrderId,
        String workOrderNumber,
        WorkOrderStatus status,
        Integer plannedQuantity,
        Instant actualStartAt,
        Instant actualEndAt,
        boolean productionCompleted,
        List<OperationExecutionResponse> executions
) {

    public static ProductionStatusResponse from(
            WorkOrder workOrder,
            List<OperationExecutionResponse> executions
    ) {
        return new ProductionStatusResponse(
                workOrder.getId(),
                workOrder.getWorkOrderNumber(),
                workOrder.getStatus(),
                workOrder.getPlannedQuantity(),
                workOrder.getActualStartAt(),
                workOrder.getActualEndAt(),
                workOrder.isProductionCompleted(),
                executions
        );
    }
}
