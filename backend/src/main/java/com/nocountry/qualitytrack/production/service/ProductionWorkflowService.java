package com.nocountry.qualitytrack.production.service;

import com.nocountry.qualitytrack.machines.entity.Machine;
import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityDisposition;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.machines.repository.MachineRepository;
import com.nocountry.qualitytrack.production.dto.request.CancelOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.request.CompleteOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.request.StartOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.response.OperationExecutionResponse;
import com.nocountry.qualitytrack.production.dto.response.ProductionStatusResponse;
import com.nocountry.qualitytrack.production.entity.OperationExecution;
import com.nocountry.qualitytrack.production.enums.OperationExecutionStatus;
import com.nocountry.qualitytrack.production.repository.OperationExecutionRepository;
import com.nocountry.qualitytrack.quality.entity.QualityInspection;
import com.nocountry.qualitytrack.quality.repository.QualityInspectionRepository;
import com.nocountry.qualitytrack.routing.entity.RoutingOperation;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.enums.RoutingSheetStatus;
import com.nocountry.qualitytrack.routing.repository.RoutingOperationRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import com.nocountry.qualitytrack.workorders.service.WorkOrderAccessPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductionWorkflowService {

    private final WorkOrderAccessPolicy accessPolicy;
    private final WorkOrderRepository workOrderRepository;
    private final RoutingOperationRepository routingOperationRepository;
    private final OperationExecutionRepository executionRepository;
    private final MachineRepository machineRepository;
    private final QualityInspectionRepository qualityInspectionRepository;
    private final TraceabilityService traceabilityService;

    @Transactional
    public OperationExecutionResponse start(
            Long currentUserId,
            Long operationId,
            StartOperationExecutionRequest request
    ) {
        User actor = accessPolicy.requireProductionActor(currentUserId);
        LockedOperation locked = lockWorkOrderThenOperation(operationId);
        WorkOrder workOrder = locked.workOrder();
        RoutingOperation operation = locked.operation();

        requireExecutable(workOrder, operation);

        if (executionRepository.existsByRoutingOperation_IdAndStatus(
                operationId,
                OperationExecutionStatus.IN_PROGRESS
        )) {
            conflict("La operación ya tiene una ejecución en progreso.");
        }
        if (executionRepository.existsByRoutingOperation_IdAndStatus(
                operationId,
                OperationExecutionStatus.COMPLETED
        )) {
            conflict("La operación ya fue completada.");
        }

        requirePreviousOperationsCompleted(operation);

        User operator = request.operatorId() == null
                ? actor
                : accessPolicy.requireProductionActor(request.operatorId());

        Machine machine = null;
        if (request.machineId() != null) {
            machine = machineRepository.findByIdForUpdate(request.machineId())
                    .orElseThrow(() -> notFound("No se encontró la máquina."));
            try {
                machine.startUse();
            } catch (IllegalArgumentException | IllegalStateException exception) {
                conflict(exception.getMessage());
            }
        }

        Instant startedAt = Instant.now();
        int attemptNumber = Math.toIntExact(
                executionRepository.countByRoutingOperation_Id(operationId) + 1
        );

        boolean productionStarted = false;
        boolean reworkStarted = false;

        try {
            if (operation.getRoutingSheet().getPurpose() == RoutingPurpose.PRODUCTION
                    && workOrder.getStatus() == WorkOrderStatus.READY_FOR_PRODUCTION) {
                workOrder.startProduction(startedAt);
                productionStarted = true;
            } else if (operation.getRoutingSheet().getPurpose() == RoutingPurpose.REWORK
                    && workOrder.getStatus() == WorkOrderStatus.QUALITY_HOLD) {
                workOrder.startRework();
                reworkStarted = true;
            }
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        OperationExecution execution;
        try {
            execution = OperationExecution.start(
                    operation,
                    operator,
                    machine,
                    attemptNumber,
                    request.startNotes(),
                    startedAt
            );
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        execution = executionRepository.saveAndFlush(execution);
        workOrderRepository.saveAndFlush(workOrder);

        if (productionStarted) {
            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.WORK_ORDER,
                    workOrder.getId(),
                    TraceabilityEventType.PRODUCTION_STARTED,
                    WorkOrderStatus.READY_FOR_PRODUCTION.name(),
                    WorkOrderStatus.IN_PRODUCTION.name(),
                    currentUserId,
                    metadata(
                            "workOrderNumber", workOrder.getWorkOrderNumber(),
                            "routingSheetId", operation.getRoutingSheet().getId()
                    )
            );
        }

        if (reworkStarted) {
            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.WORK_ORDER,
                    workOrder.getId(),
                    TraceabilityEventType.REWORK_STARTED,
                    WorkOrderStatus.QUALITY_HOLD.name(),
                    WorkOrderStatus.REWORK_IN_PROGRESS.name(),
                    currentUserId,
                    metadata(
                            "workOrderNumber", workOrder.getWorkOrderNumber(),
                            "routingSheetId", operation.getRoutingSheet().getId(),
                            "routingRevision", operation.getRoutingSheet().getRevision(),
                            "nonConformityId",
                            operation.getRoutingSheet().getNonConformity().getId()
                    )
            );
        }

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.OPERATION_EXECUTION,
                execution.getId(),
                TraceabilityEventType.OPERATION_EXECUTION_STARTED,
                null,
                execution.getStatus().name(),
                currentUserId,
                metadata(
                        "operationId", operation.getId(),
                        "sequenceNumber", operation.getSequenceNumber(),
                        "operationCode", operation.getCode(),
                        "attemptNumber", execution.getAttemptNumber(),
                        "operatorId", operator.getId(),
                        "machineId", machine == null ? null : machine.getId()
                )
        );

        return OperationExecutionResponse.from(execution);
    }

    @Transactional
    public OperationExecutionResponse complete(
            Long currentUserId,
            Long executionId,
            CompleteOperationExecutionRequest request
    ) {
        accessPolicy.requireProductionActor(currentUserId);
        LockedExecution locked = lockWorkOrderThenExecution(executionId);
        WorkOrder workOrder = locked.workOrder();
        OperationExecution execution = locked.execution();

        requireExecutionOpen(workOrder, execution.getRoutingOperation());

        Machine machine = lockAssignedMachine(execution);
        Instant finishedAt = Instant.now();
        OperationExecutionStatus previousStatus = execution.getStatus();

        try {
            execution.complete(
                    request.quantityProcessed(),
                    request.quantityAccepted(),
                    request.quantityRejected(),
                    request.completionNotes(),
                    finishedAt
            );
            if (machine != null) {
                machine.release();
            }
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        execution = executionRepository.saveAndFlush(execution);

        boolean routingCompleted = allOperationsCompleted(
                execution.getRoutingOperation()
        );
        boolean productionCompleted = false;
        boolean reworkCompleted = false;
        QualityInspection reinspection = null;

        if (routingCompleted) {
            try {
                if (execution.getRoutingOperation()
                        .getRoutingSheet()
                        .getPurpose() == RoutingPurpose.PRODUCTION) {
                    workOrder.markProductionCompleted(finishedAt);
                    productionCompleted = true;
                } else {
                    NonConformity nonConformity = execution
                            .getRoutingOperation()
                            .getRoutingSheet()
                            .getNonConformity();

                    requireOpenReworkNonConformity(nonConformity);

                    reinspection = QualityInspection.createReinspection(
                            workOrder,
                            nonConformity
                    );
                    workOrder.sendReworkToQuality();
                    reworkCompleted = true;
                }
            } catch (IllegalArgumentException | IllegalStateException exception) {
                conflict(exception.getMessage());
            }
        }

        if (reinspection != null) {
            reinspection = qualityInspectionRepository.saveAndFlush(reinspection);
        }
        workOrderRepository.saveAndFlush(workOrder);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.OPERATION_EXECUTION,
                execution.getId(),
                TraceabilityEventType.OPERATION_EXECUTION_COMPLETED,
                previousStatus.name(),
                execution.getStatus().name(),
                currentUserId,
                metadata(
                        "operationId", execution.getRoutingOperation().getId(),
                        "sequenceNumber", execution.getRoutingOperation().getSequenceNumber(),
                        "operationCode", execution.getRoutingOperation().getCode(),
                        "attemptNumber", execution.getAttemptNumber(),
                        "quantityProcessed", execution.getQuantityProcessed(),
                        "quantityAccepted", execution.getQuantityAccepted(),
                        "quantityRejected", execution.getQuantityRejected(),
                        "machineId", machine == null ? null : machine.getId()
                )
        );

        if (productionCompleted) {
            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.WORK_ORDER,
                    workOrder.getId(),
                    TraceabilityEventType.PRODUCTION_COMPLETED,
                    WorkOrderStatus.IN_PRODUCTION.name(),
                    WorkOrderStatus.IN_PRODUCTION.name(),
                    currentUserId,
                    metadata(
                            "workOrderNumber", workOrder.getWorkOrderNumber(),
                            "completedAt", workOrder.getActualEndAt()
                    )
            );
        }

        if (reworkCompleted) {
            NonConformity nonConformity = execution
                    .getRoutingOperation()
                    .getRoutingSheet()
                    .getNonConformity();

            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.WORK_ORDER,
                    workOrder.getId(),
                    TraceabilityEventType.REWORK_COMPLETED,
                    WorkOrderStatus.REWORK_IN_PROGRESS.name(),
                    WorkOrderStatus.QUALITY_PENDING.name(),
                    currentUserId,
                    metadata(
                            "routingSheetId",
                            execution.getRoutingOperation().getRoutingSheet().getId(),
                            "routingRevision",
                            execution.getRoutingOperation().getRoutingSheet().getRevision(),
                            "nonConformityId", nonConformity.getId(),
                            "qualityInspectionId", reinspection.getId()
                    )
            );

            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.QUALITY_INSPECTION,
                    reinspection.getId(),
                    TraceabilityEventType.QUALITY_INSPECTION_CREATED,
                    null,
                    com.nocountry.qualitytrack.quality.enums.QualityInspectionStatus.PENDING.name(),
                    currentUserId,
                    metadata(
                            "workOrderId", workOrder.getId(),
                            "reworkNonConformityId", nonConformity.getId()
                    )
            );
        }

        return OperationExecutionResponse.from(execution);
    }

    @Transactional
    public OperationExecutionResponse cancel(
            Long currentUserId,
            Long executionId,
            CancelOperationExecutionRequest request
    ) {
        accessPolicy.requireProductionActor(currentUserId);
        LockedExecution locked = lockWorkOrderThenExecution(executionId);
        WorkOrder workOrder = locked.workOrder();
        OperationExecution execution = locked.execution();

        requireExecutionOpen(workOrder, execution.getRoutingOperation());

        Machine machine = lockAssignedMachine(execution);
        OperationExecutionStatus previousStatus = execution.getStatus();

        try {
            execution.cancel(request.cancellationReason(), Instant.now());
            if (machine != null) {
                machine.release();
            }
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        execution = executionRepository.saveAndFlush(execution);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.OPERATION_EXECUTION,
                execution.getId(),
                TraceabilityEventType.OPERATION_EXECUTION_CANCELLED,
                previousStatus.name(),
                execution.getStatus().name(),
                currentUserId,
                metadata(
                        "operationId", execution.getRoutingOperation().getId(),
                        "sequenceNumber", execution.getRoutingOperation().getSequenceNumber(),
                        "operationCode", execution.getRoutingOperation().getCode(),
                        "attemptNumber", execution.getAttemptNumber(),
                        "machineId", machine == null ? null : machine.getId(),
                        "reason", request.cancellationReason()
                )
        );

        return OperationExecutionResponse.from(execution);
    }

    @Transactional(readOnly = true)
    public ProductionStatusResponse getStatus(
            Long currentUserId,
            Long workOrderId
    ) {
        accessPolicy.requireInternalReader(currentUserId);

        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));

        List<OperationExecutionResponse> executions = executionRepository.findAllByWorkOrderIdOrdered(workOrderId)
                .stream()
                .map(OperationExecutionResponse::from)
                .toList();

        return ProductionStatusResponse.from(workOrder, executions);
    }

    private LockedOperation lockWorkOrderThenOperation(Long operationId) {
        Long workOrderId = routingOperationRepository.findWorkOrderIdById(operationId)
                .orElseThrow(() -> notFound("No se encontró la operación de la hoja de ruta."));
        WorkOrder workOrder = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));
        RoutingOperation operation = routingOperationRepository.findByIdForUpdate(operationId)
                .orElseThrow(() -> notFound("No se encontró la operación de la hoja de ruta."));

        if (!operation.getRoutingSheet().getWorkOrder().getId().equals(workOrder.getId())) {
            conflict("La operación ya no pertenece a la orden de trabajo esperada.");
        }

        return new LockedOperation(workOrder, operation);
    }

    private LockedExecution lockWorkOrderThenExecution(Long executionId) {
        Long workOrderId = executionRepository.findWorkOrderIdById(executionId)
                .orElseThrow(() -> notFound("No se encontró la ejecución."));
        WorkOrder workOrder = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));
        OperationExecution execution = executionRepository.findByIdForUpdate(executionId)
                .orElseThrow(() -> notFound("No se encontró la ejecución."));

        if (!execution.getRoutingOperation()
                .getRoutingSheet()
                .getWorkOrder()
                .getId()
                .equals(workOrder.getId())) {
            conflict("La ejecución ya no pertenece a la orden de trabajo esperada.");
        }

        return new LockedExecution(workOrder, execution);
    }

    private Machine lockAssignedMachine(OperationExecution execution) {
        if (execution.getMachine() == null) {
            return null;
        }
        return machineRepository.findByIdForUpdate(execution.getMachine().getId())
                .orElseThrow(() -> notFound("No se encontró la máquina asignada."));
    }

    private void requireExecutable(WorkOrder workOrder, RoutingOperation operation) {
        if (operation.getRoutingSheet().getStatus() != RoutingSheetStatus.RELEASED) {
            conflict("Solo pueden ejecutarse operaciones de una hoja de ruta RELEASED.");
        }

        if (operation.getRoutingSheet().getPurpose() == RoutingPurpose.PRODUCTION) {
            if (workOrder.getStatus() != WorkOrderStatus.READY_FOR_PRODUCTION
                    && workOrder.getStatus() != WorkOrderStatus.IN_PRODUCTION) {
                conflict("La orden no está disponible para ejecución de producción.");
            }
            if (workOrder.isProductionCompleted()) {
                conflict("La producción de la orden ya fue completada.");
            }
            return;
        }

        if (workOrder.getStatus() != WorkOrderStatus.QUALITY_HOLD
                && workOrder.getStatus() != WorkOrderStatus.REWORK_IN_PROGRESS) {
            conflict("La orden no está disponible para ejecución de retrabajo.");
        }

        requireOpenReworkNonConformity(
                operation.getRoutingSheet().getNonConformity()
        );
    }

    private void requireExecutionOpen(
            WorkOrder workOrder,
            RoutingOperation operation
    ) {
        if (operation.getRoutingSheet().getPurpose() == RoutingPurpose.PRODUCTION) {
            if (workOrder.getStatus() != WorkOrderStatus.IN_PRODUCTION) {
                conflict("La orden debe estar IN_PRODUCTION para modificar una ejecución.");
            }
            if (workOrder.isProductionCompleted()) {
                conflict("La producción de la orden ya fue completada.");
            }
            return;
        }

        if (workOrder.getStatus() != WorkOrderStatus.REWORK_IN_PROGRESS) {
            conflict("La orden debe estar REWORK_IN_PROGRESS para modificar una ejecución de retrabajo.");
        }

        requireOpenReworkNonConformity(
                operation.getRoutingSheet().getNonConformity()
        );
    }

    private void requireOpenReworkNonConformity(NonConformity nonConformity) {
        if (nonConformity == null
                || nonConformity.getStatus() != NonConformityStatus.OPEN
                || nonConformity.getDisposition() != NonConformityDisposition.REWORK) {
            conflict("El retrabajo requiere una no conformidad OPEN con disposición REWORK.");
        }
    }

    private void requirePreviousOperationsCompleted(RoutingOperation operation) {
        List<RoutingOperation> operations = routingOperationRepository
                .findAllByRoutingSheet_IdOrderBySequenceNumberAsc(
                        operation.getRoutingSheet().getId()
                );

        for (RoutingOperation previous : operations) {
            if (previous.getSequenceNumber() >= operation.getSequenceNumber()) {
                break;
            }
            if (!executionRepository.existsByRoutingOperation_IdAndStatus(
                    previous.getId(),
                    OperationExecutionStatus.COMPLETED
            )) {
                conflict(
                        "La operación anterior " + previous.getCode()
                                + " debe completarse antes de iniciar esta operación."
                );
            }
        }
    }

    private boolean allOperationsCompleted(RoutingOperation currentOperation) {
        List<RoutingOperation> operations = routingOperationRepository
                .findAllByRoutingSheet_IdOrderBySequenceNumberAsc(
                        currentOperation.getRoutingSheet().getId()
                );

        return !operations.isEmpty()
                && operations.stream().allMatch(operation ->
                executionRepository.existsByRoutingOperation_IdAndStatus(
                        operation.getId(),
                        OperationExecutionStatus.COMPLETED
                ));
    }

    private Map<String, Object> metadata(Object... entries) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        for (int index = 0; index < entries.length; index += 2) {
            Object value = entries[index + 1];
            if (value != null) {
                metadata.put(String.valueOf(entries[index]), value);
            }
        }
        return metadata;
    }

    private BusinessException notFound(String message) {
        return new BusinessException(ApiErrorCode.RESOURCE_NOT_FOUND, message);
    }

    private void conflict(String message) {
        throw new BusinessException(ApiErrorCode.DATA_CONFLICT, message);
    }

    private record LockedOperation(
            WorkOrder workOrder,
            RoutingOperation operation
    ) {
    }

    private record LockedExecution(
            WorkOrder workOrder,
            OperationExecution execution
    ) {
    }
}
