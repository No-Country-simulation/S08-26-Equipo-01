package com.nocountry.qualitytrack.production.dto.response;

import com.nocountry.qualitytrack.machines.entity.Machine;
import com.nocountry.qualitytrack.production.entity.OperationExecution;
import com.nocountry.qualitytrack.production.enums.OperationExecutionStatus;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;

import java.time.Instant;

public record OperationExecutionResponse(
        Long id,
        Long workOrderId,
        String workOrderNumber,
        WorkOrderStatus workOrderStatus,
        Long routingSheetId,
        Integer routingRevision,
        RoutingPurpose routingPurpose,
        Long routingOperationId,
        Integer sequenceNumber,
        String operationCode,
        String operationName,
        Integer attemptNumber,
        OperationExecutionStatus status,
        Long operatorId,
        String operatorName,
        Long machineId,
        String machineCode,
        String machineName,
        Instant startedAt,
        Instant finishedAt,
        Integer quantityProcessed,
        Integer quantityAccepted,
        Integer quantityRejected,
        String startNotes,
        String completionNotes,
        String cancellationReason
) {

    public static OperationExecutionResponse from(OperationExecution execution) {
        var operation = execution.getRoutingOperation();
        var routingSheet = operation.getRoutingSheet();
        var workOrder = routingSheet.getWorkOrder();
        Machine machine = execution.getMachine();

        return new OperationExecutionResponse(
                execution.getId(),
                workOrder.getId(),
                workOrder.getWorkOrderNumber(),
                workOrder.getStatus(),
                routingSheet.getId(),
                routingSheet.getRevision(),
                routingSheet.getPurpose(),
                operation.getId(),
                operation.getSequenceNumber(),
                operation.getCode(),
                operation.getName(),
                execution.getAttemptNumber(),
                execution.getStatus(),
                execution.getOperator().getId(),
                fullName(execution.getOperator()),
                machine == null ? null : machine.getId(),
                machine == null ? null : machine.getCode(),
                machine == null ? null : machine.getName(),
                execution.getStartedAt(),
                execution.getFinishedAt(),
                execution.getQuantityProcessed(),
                execution.getQuantityAccepted(),
                execution.getQuantityRejected(),
                execution.getStartNotes(),
                execution.getCompletionNotes(),
                execution.getCancellationReason()
        );
    }

    private static String fullName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
