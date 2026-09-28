package com.nocountry.qualitytrack.routing.service;

import com.nocountry.qualitytrack.routing.dto.request.ReopenRoutingSheetRequest;
import com.nocountry.qualitytrack.routing.dto.response.RoutingSheetResponse;
import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.enums.RoutingSheetStatus;
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

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RoutingWorkflowService {

    private final RoutingSheetRepository routingSheetRepository;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderDocumentRepository workOrderDocumentRepository;
    private final RoutingAccessPolicy accessPolicy;
    private final TraceabilityService traceabilityService;

    @Transactional
    public RoutingSheetResponse approve(
            Long currentUserId,
            Long routingSheetId
    ) {
        User actor = accessPolicy.requireDesignerActor(currentUserId);
        LockedRouting locked = lockWorkOrderThenRouting(routingSheetId);
        RoutingSheet routingSheet = locked.routingSheet();

        if (!workOrderDocumentRepository.existsByWorkOrder_Id(locked.workOrder().getId())) {
            conflict("La hoja de ruta no puede aprobarse sin documentos fijados.");
        }

        RoutingSheetStatus previousStatus = routingSheet.getStatus();

        try {
            routingSheet.approve(actor, Instant.now());
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        routingSheet = routingSheetRepository.saveAndFlush(routingSheet);

        traceabilityService.record(
                locked.workOrder().getJobCase(),
                TraceabilityAggregateType.ROUTING_SHEET,
                routingSheet.getId(),
                TraceabilityEventType.ROUTING_SHEET_APPROVED,
                previousStatus.name(),
                routingSheet.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderId", locked.workOrder().getId(),
                        "workOrderNumber", locked.workOrder().getWorkOrderNumber(),
                        "revision", routingSheet.getRevision(),
                        "purpose", routingSheet.getPurpose(),
                        "operationCount", routingSheet.getOperations().size(),
                        "estimatedMinutes", routingSheet.totalEstimatedMinutes()
                )
        );

        return RoutingSheetResponse.from(routingSheet);
    }

    @Transactional
    public RoutingSheetResponse reopen(
            Long currentUserId,
            Long routingSheetId,
            ReopenRoutingSheetRequest input
    ) {
        accessPolicy.requireDesignerActor(currentUserId);
        LockedRouting locked = lockWorkOrderThenRouting(routingSheetId);
        RoutingSheet routingSheet = locked.routingSheet();

        RoutingSheetStatus previousStatus = routingSheet.getStatus();
        Long previousApprovedByUserId = routingSheet.getApprovedByUser() == null
                ? null
                : routingSheet.getApprovedByUser().getId();
        Instant previousApprovedAt = routingSheet.getApprovedAt();

        try {
            routingSheet.reopen();
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        routingSheet = routingSheetRepository.saveAndFlush(routingSheet);

        traceabilityService.record(
                locked.workOrder().getJobCase(),
                TraceabilityAggregateType.ROUTING_SHEET,
                routingSheet.getId(),
                TraceabilityEventType.ROUTING_SHEET_REOPENED,
                previousStatus.name(),
                routingSheet.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderId", locked.workOrder().getId(),
                        "workOrderNumber", locked.workOrder().getWorkOrderNumber(),
                        "revision", routingSheet.getRevision(),
                        "purpose", routingSheet.getPurpose(),
                        "reason", input.reason().trim(),
                        "previousApprovedByUserId", previousApprovedByUserId,
                        "previousApprovedAt", previousApprovedAt
                )
        );

        return RoutingSheetResponse.from(routingSheet);
    }

    @Transactional
    public RoutingSheetResponse release(
            Long currentUserId,
            Long routingSheetId
    ) {
        User actor = accessPolicy.requireDesignerActor(currentUserId);
        LockedRouting locked = lockWorkOrderThenRouting(routingSheetId);
        WorkOrder workOrder = locked.workOrder();
        RoutingSheet routingSheet = locked.routingSheet();

        if (routingSheet.getStatus() != RoutingSheetStatus.APPROVED) {
            conflict("La hoja de ruta debe estar APPROVED antes de liberarse.");
        }
        if (!workOrderDocumentRepository.existsByWorkOrder_Id(workOrder.getId())) {
            conflict("La orden de trabajo necesita al menos un documento fijado antes de liberar una ruta.");
        }
        if (routingSheet.getOperations().isEmpty()) {
            conflict("La hoja de ruta necesita al menos una operación antes de liberarse.");
        }

        boolean productionRouting = routingSheet.getPurpose() == RoutingPurpose.PRODUCTION;

        if (productionRouting) {
            if (workOrder.getStatus() != WorkOrderStatus.CREATED) {
                conflict("La orden de trabajo debe estar en CREATED para liberar la ruta de producción.");
            }
            if (workOrder.getPlannedQuantity() == null
                    || workOrder.getPlannedQuantity() <= 0
                    || workOrder.getPlannedStartDate() == null
                    || workOrder.getPlannedEndDate() == null) {
                conflict("La orden de trabajo necesita planificación completa antes de liberarse.");
            }
        } else {
            if (workOrder.getStatus() != WorkOrderStatus.QUALITY_HOLD) {
                conflict("La orden debe estar QUALITY_HOLD para liberar una ruta REWORK.");
            }
            if (routingSheet.getNonConformity() == null
                    || routingSheet.getNonConformity().getStatus()
                    != com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus.OPEN
                    || routingSheet.getNonConformity().getDisposition()
                    != com.nocountry.qualitytrack.nonconformities.enums.NonConformityDisposition.REWORK) {
                conflict("La ruta REWORK requiere una no conformidad OPEN con disposición REWORK.");
            }
        }

        RoutingSheetStatus previousRoutingStatus = routingSheet.getStatus();
        WorkOrderStatus previousWorkOrderStatus = workOrder.getStatus();
        Instant releasedAt = Instant.now();

        try {
            routingSheet.release(actor, releasedAt);
            if (productionRouting) {
                workOrder.releaseToProduction();
            }
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        if (productionRouting) {
            workOrderRepository.save(workOrder);
        }
        routingSheet = routingSheetRepository.saveAndFlush(routingSheet);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.ROUTING_SHEET,
                routingSheet.getId(),
                TraceabilityEventType.ROUTING_SHEET_RELEASED,
                previousRoutingStatus.name(),
                routingSheet.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderId", workOrder.getId(),
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "revision", routingSheet.getRevision(),
                        "purpose", routingSheet.getPurpose(),
                        "nonConformityId",
                        routingSheet.getNonConformity() == null
                                ? null
                                : routingSheet.getNonConformity().getId(),
                        "operationCount", routingSheet.getOperations().size(),
                        "estimatedMinutes", routingSheet.totalEstimatedMinutes()
                )
        );

        if (productionRouting) {
            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.WORK_ORDER,
                    workOrder.getId(),
                    TraceabilityEventType.WORK_ORDER_RELEASED,
                    previousWorkOrderStatus.name(),
                    workOrder.getStatus().name(),
                    currentUserId,
                    metadata(
                            "workOrderNumber", workOrder.getWorkOrderNumber(),
                            "routingSheetId", routingSheet.getId(),
                            "routingRevision", routingSheet.getRevision(),
                            "routingPurpose", routingSheet.getPurpose()
                    )
            );
        }

        return RoutingSheetResponse.from(routingSheet);
    }

    private LockedRouting lockWorkOrderThenRouting(Long routingSheetId) {
        Long workOrderId = routingSheetRepository.findWorkOrderIdById(routingSheetId)
                .orElseThrow(() -> notFound("No se encontró la hoja de ruta."));

        WorkOrder workOrder = workOrderRepository
                .findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));

        RoutingSheet routingSheet = routingSheetRepository
                .findByIdForUpdate(routingSheetId)
                .orElseThrow(() -> notFound("No se encontró la hoja de ruta."));

        if (!routingSheet.getWorkOrder().getId().equals(workOrder.getId())) {
            conflict("La hoja de ruta ya no pertenece a la orden de trabajo esperada.");
        }

        return new LockedRouting(workOrder, routingSheet);
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
