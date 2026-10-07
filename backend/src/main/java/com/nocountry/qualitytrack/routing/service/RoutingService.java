package com.nocountry.qualitytrack.routing.service;

import com.nocountry.qualitytrack.routing.dto.request.CreateRoutingOperationRequest;
import com.nocountry.qualitytrack.routing.dto.request.UpdateRoutingOperationRequest;
import com.nocountry.qualitytrack.routing.dto.response.RoutingSheetResponse;
import com.nocountry.qualitytrack.routing.entity.RoutingOperation;
import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.repository.RoutingSheetRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderDocumentRepository;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RoutingService {

    private final RoutingSheetRepository routingSheetRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderDocumentRepository workOrderDocumentRepository;
    private final RoutingAccessPolicy accessPolicy;
    private final TraceabilityService traceabilityService;

    @Transactional
    public RoutingSheetResponse createProductionRouting(
            Long currentUserId,
            Long workOrderId
    ) {
        User actor = accessPolicy.requireDesignerActor(currentUserId);
        WorkOrder workOrder = requireWorkOrderForUpdate(workOrderId);
        requireCreated(workOrder);

        if (!workOrderDocumentRepository.existsByWorkOrder_Id(workOrderId)) {
            conflict("La hoja de ruta requiere al menos un documento fijado en la orden de trabajo.");
        }
        if (routingSheetRepository.existsByWorkOrder_IdAndPurpose(
                workOrderId,
                RoutingPurpose.PRODUCTION
        )) {
            conflict("La orden de trabajo ya tiene una hoja de ruta de producción.");
        }

        RoutingSheet routingSheet;
        try {
            routingSheet = RoutingSheet.createProduction(workOrder, actor);
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        routingSheet = routingSheetRepository.saveAndFlush(routingSheet);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.ROUTING_SHEET,
                routingSheet.getId(),
                TraceabilityEventType.ROUTING_SHEET_CREATED,
                null,
                routingSheet.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderId", workOrder.getId(),
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "revision", routingSheet.getRevision(),
                        "purpose", routingSheet.getPurpose()
                )
        );

        return RoutingSheetResponse.from(routingSheet);
    }

    @Transactional(readOnly = true)
    public List<RoutingSheetResponse> list(
            Long currentUserId,
            Long workOrderId
    ) {
        accessPolicy.requireInternalReader(currentUserId);

        if (!workOrderRepository.existsById(workOrderId)) {
            throw notFound("No se encontró la orden de trabajo.");
        }

        return routingSheetRepository.findAllByWorkOrder_IdOrderByRevisionAsc(workOrderId)
                .stream()
                .map(RoutingSheetResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RoutingSheetResponse get(
            Long currentUserId,
            Long routingSheetId
    ) {
        accessPolicy.requireInternalReader(currentUserId);
        return RoutingSheetResponse.from(requireRouting(routingSheetId));
    }

    @Transactional
    public RoutingSheetResponse addOperation(
            Long currentUserId,
            Long routingSheetId,
            CreateRoutingOperationRequest input
    ) {
        accessPolicy.requireDesignerActor(currentUserId);
        LockedRouting locked = lockWorkOrderThenRouting(routingSheetId);
        RoutingSheet routingSheet = locked.routingSheet();
        RoutingOperation operation;
        boolean resequenceOperations = Boolean.TRUE.equals(input.resequenceOperations());

        try {
            operation = routingSheet.addOperation(
                    input.sequenceNumber(),
                    input.code(),
                    input.name(),
                    input.instructions(),
                    input.estimatedMinutes(),
                    resequenceOperations
            );
            operation.replacePrerequisites(resolvePrerequisites(
                    routingSheet,
                    operation,
                    input.prerequisiteOperationIds(),
                    true
            ));
            routingSheet.validateDependencyOrder();
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        routingSheet = routingSheetRepository.saveAndFlush(routingSheet);

        traceabilityService.record(
                locked.workOrder().getJobCase(),
                TraceabilityAggregateType.ROUTING_SHEET,
                routingSheet.getId(),
                TraceabilityEventType.ROUTING_OPERATION_ADDED,
                routingSheet.getStatus().name(),
                routingSheet.getStatus().name(),
                currentUserId,
                metadata(
                        "revision", routingSheet.getRevision(),
                        "operationId", operation.getId(),
                        "sequenceNumber", input.sequenceNumber(),
                        "code", input.code(),
                        "estimatedMinutes", input.estimatedMinutes(),
                        "prerequisiteOperationIds", prerequisiteIds(operation),
                        "resequenceOperations", resequenceOperations
                )
        );

        return RoutingSheetResponse.from(routingSheet);
    }

    @Transactional
    public RoutingSheetResponse updateOperation(
            Long currentUserId,
            Long routingSheetId,
            Long operationId,
            UpdateRoutingOperationRequest input
    ) {
        accessPolicy.requireDesignerActor(currentUserId);
        LockedRouting locked = lockWorkOrderThenRouting(routingSheetId);
        RoutingSheet routingSheet = locked.routingSheet();

        RoutingOperation previousOperation = routingSheet.findOperation(operationId)
                .orElseThrow(() -> notFound(
                        "No se encontró la operación dentro de la hoja de ruta."
                ));
        Integer previousSequenceNumber = previousOperation.getSequenceNumber();
        String previousCode = previousOperation.getCode();
        String previousName = previousOperation.getName();
        String previousInstructions = previousOperation.getInstructions();
        Integer previousEstimatedMinutes = previousOperation.getEstimatedMinutes();
        List<RoutingOperation> previousPrerequisites = new ArrayList<>(
                previousOperation.getPrerequisites()
        );
        List<Long> previousPrerequisiteIds = prerequisiteIds(previousOperation);
        RoutingOperation operation;
        boolean resequenceOperations = Boolean.TRUE.equals(input.resequenceOperations());

        try {
            operation = routingSheet.updateOperation(
                    operationId,
                    input.sequenceNumber(),
                    input.code(),
                    input.name(),
                    input.instructions(),
                    input.estimatedMinutes(),
                    resequenceOperations
            );

            if (input.prerequisiteOperationIds() == null) {
                operation.replacePrerequisites(previousPrerequisites);
            } else {
                operation.replacePrerequisites(resolvePrerequisites(
                        routingSheet,
                        operation,
                        input.prerequisiteOperationIds(),
                        false
                ));
            }
            routingSheet.validateDependencyOrder();
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        routingSheet = routingSheetRepository.saveAndFlush(routingSheet);

        traceabilityService.record(
                locked.workOrder().getJobCase(),
                TraceabilityAggregateType.ROUTING_SHEET,
                routingSheet.getId(),
                TraceabilityEventType.ROUTING_OPERATION_UPDATED,
                routingSheet.getStatus().name(),
                routingSheet.getStatus().name(),
                currentUserId,
                metadata(
                        "operationId", operationId,
                        "previousSequenceNumber", previousSequenceNumber,
                        "previousCode", previousCode,
                        "previousName", previousName,
                        "previousInstructions", previousInstructions,
                        "previousEstimatedMinutes", previousEstimatedMinutes,
                        "previousPrerequisiteOperationIds", previousPrerequisiteIds,
                        "sequenceNumber", input.sequenceNumber(),
                        "code", input.code(),
                        "name", input.name(),
                        "instructions", input.instructions(),
                        "estimatedMinutes", input.estimatedMinutes(),
                        "prerequisiteOperationIds", prerequisiteIds(operation),
                        "resequenceOperations", resequenceOperations
                )
        );

        return RoutingSheetResponse.from(routingSheet);
    }

    @Transactional
    public RoutingSheetResponse removeOperation(
            Long currentUserId,
            Long routingSheetId,
            Long operationId
    ) {
        accessPolicy.requireDesignerActor(currentUserId);
        LockedRouting locked = lockWorkOrderThenRouting(routingSheetId);
        RoutingSheet routingSheet = locked.routingSheet();

        RoutingOperation operation = routingSheet.findOperation(operationId)
                .orElseThrow(() -> notFound(
                        "No se encontró la operación dentro de la hoja de ruta."
                ));

        List<RoutingOperation> dependents = routingSheet.getOperations().stream()
                .filter(candidate -> candidate.getPrerequisites().contains(operation))
                .toList();
        if (!dependents.isEmpty()) {
            String dependentCodes = dependents.stream()
                    .map(RoutingOperation::getCode)
                    .sorted()
                    .reduce((left, right) -> left + ", " + right)
                    .orElse("");
            conflict(
                    "No puedes eliminar " + operation.getCode()
                            + " porque todavía es requisito de: " + dependentCodes + "."
            );
        }

        Map<String, Object> eventMetadata = metadata(
                "operationId", operation.getId(),
                "sequenceNumber", operation.getSequenceNumber(),
                "code", operation.getCode(),
                "name", operation.getName(),
                "instructions", operation.getInstructions(),
                "estimatedMinutes", operation.getEstimatedMinutes(),
                "prerequisiteOperationIds", prerequisiteIds(operation)
        );

        try {
            routingSheet.removeOperation(operationId);
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        routingSheet = routingSheetRepository.saveAndFlush(routingSheet);

        traceabilityService.record(
                locked.workOrder().getJobCase(),
                TraceabilityAggregateType.ROUTING_SHEET,
                routingSheet.getId(),
                TraceabilityEventType.ROUTING_OPERATION_REMOVED,
                routingSheet.getStatus().name(),
                routingSheet.getStatus().name(),
                currentUserId,
                eventMetadata
        );

        return RoutingSheetResponse.from(routingSheet);
    }

    private List<RoutingOperation> resolvePrerequisites(
            RoutingSheet routingSheet,
            RoutingOperation operation,
            List<Long> requestedIds,
            boolean defaultToPrevious
    ) {
        List<RoutingOperation> availablePrevious = routingSheet.getOperations().stream()
                .filter(candidate -> candidate != operation)
                .filter(candidate -> candidate.getSequenceNumber() < operation.getSequenceNumber())
                .sorted((left, right) -> Integer.compare(
                        left.getSequenceNumber(),
                        right.getSequenceNumber()
                ))
                .toList();

        if (requestedIds == null) {
            if (!defaultToPrevious || availablePrevious.isEmpty()) {
                return List.of();
            }
            return List.of(availablePrevious.get(availablePrevious.size() - 1));
        }

        Set<Long> uniqueIds = new HashSet<>();
        List<RoutingOperation> resolved = new ArrayList<>();
        for (Long prerequisiteId : requestedIds) {
            if (prerequisiteId == null || !uniqueIds.add(prerequisiteId)) {
                throw new IllegalArgumentException(
                        "Las dependencias de la operación contienen valores inválidos o repetidos."
                );
            }

            RoutingOperation prerequisite = routingSheet.findOperation(prerequisiteId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "No se encontró una de las operaciones requeridas dentro de la hoja de ruta."
                    ));

            if (prerequisite == operation
                    || prerequisite.getSequenceNumber() >= operation.getSequenceNumber()) {
                throw new IllegalArgumentException(
                        "Una operación solo puede esperar a secuencias anteriores."
                );
            }
            resolved.add(prerequisite);
        }

        return resolved;
    }

    private List<Long> prerequisiteIds(RoutingOperation operation) {
        return operation.getPrerequisites().stream()
                .sorted((left, right) -> Integer.compare(
                        left.getSequenceNumber(),
                        right.getSequenceNumber()
                ))
                .map(RoutingOperation::getId)
                .toList();
    }

    private LockedRouting lockWorkOrderThenRouting(Long routingSheetId) {
        Long workOrderId = routingSheetRepository.findWorkOrderIdById(routingSheetId)
                .orElseThrow(() -> notFound("No se encontró la hoja de ruta."));
        WorkOrder workOrder = requireWorkOrderForUpdate(workOrderId);
        RoutingSheet routingSheet = routingSheetRepository.findByIdForUpdate(routingSheetId)
                .orElseThrow(() -> notFound("No se encontró la hoja de ruta."));

        if (!routingSheet.getWorkOrder().getId().equals(workOrder.getId())) {
            conflict("La hoja de ruta ya no pertenece a la orden de trabajo esperada.");
        }

        return new LockedRouting(workOrder, routingSheet);
    }

    private RoutingSheet requireRouting(Long routingSheetId) {
        return routingSheetRepository.findById(routingSheetId)
                .orElseThrow(() -> notFound("No se encontró la hoja de ruta."));
    }

    private WorkOrder requireWorkOrderForUpdate(Long workOrderId) {
        return workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));
    }

    private void requireCreated(WorkOrder workOrder) {
        if (workOrder.getStatus() != WorkOrderStatus.CREATED) {
            conflict("La hoja de ruta solo puede prepararse mientras la orden esté en CREATED.");
        }
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

    private record LockedRouting(
            WorkOrder workOrder,
            RoutingSheet routingSheet
    ) {
    }
}
