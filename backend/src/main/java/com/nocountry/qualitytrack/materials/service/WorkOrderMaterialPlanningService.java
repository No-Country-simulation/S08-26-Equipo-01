package com.nocountry.qualitytrack.materials.service;

import com.nocountry.qualitytrack.materials.dto.request.UpsertWorkOrderMaterialPlanRequest;
import com.nocountry.qualitytrack.materials.dto.response.WorkOrderMaterialPlanResponse;
import com.nocountry.qualitytrack.materials.entity.Material;
import com.nocountry.qualitytrack.materials.entity.WorkOrderMaterialPlan;
import com.nocountry.qualitytrack.materials.repository.MaterialRepository;
import com.nocountry.qualitytrack.materials.repository.WorkOrderMaterialPlanRepository;
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
public class WorkOrderMaterialPlanningService {

    private final WorkOrderMaterialPlanRepository planRepository;
    private final WorkOrderRepository workOrderRepository;
    private final MaterialRepository materialRepository;
    private final WorkOrderAccessPolicy accessPolicy;
    private final TraceabilityService traceabilityService;

    @Transactional(readOnly = true)
    public List<WorkOrderMaterialPlanResponse> listPlans(
            Long currentUserId,
            Long workOrderId
    ) {
        accessPolicy.requireInternalReader(currentUserId);

        if (!workOrderRepository.existsById(workOrderId)) {
            throw notFound("No se encontró la orden de trabajo.");
        }

        return planRepository.findAllByWorkOrder_IdOrderByIdAsc(workOrderId)
                .stream()
                .map(WorkOrderMaterialPlanResponse::from)
                .toList();
    }

    @Transactional
    public WorkOrderMaterialPlanResponse upsertPlan(
            Long currentUserId,
            Long workOrderId,
            UpsertWorkOrderMaterialPlanRequest request
    ) {
        User actor = accessPolicy.requirePlanningActor(currentUserId);
        WorkOrder workOrder = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));

        requirePlanningOpen(workOrder);

        Material material = materialRepository.findById(request.materialId())
                .orElseThrow(() -> notFound("No se encontró el material seleccionado."));

        Instant now = Instant.now();
        WorkOrderMaterialPlan plan = planRepository
                .findByWorkOrder_IdAndMaterial_Id(workOrderId, material.getId())
                .orElse(null);

        try {
            if (plan == null) {
                plan = WorkOrderMaterialPlan.create(
                        workOrder,
                        material,
                        request.plannedQuantity(),
                        actor,
                        now
                );
            } else {
                plan.update(request.plannedQuantity(), actor, now);
            }
        } catch (IllegalArgumentException exception) {
            conflict(exception.getMessage());
        }

        plan = planRepository.saveAndFlush(plan);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.WORK_ORDER,
                workOrder.getId(),
                TraceabilityEventType.WORK_ORDER_MATERIAL_PLANNED,
                workOrder.getStatus().name(),
                workOrder.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "materialId", material.getId(),
                        "materialCode", material.getCode(),
                        "materialName", material.getName(),
                        "plannedQuantity", plan.getPlannedQuantity(),
                        "unit", material.getUnit()
                )
        );

        return WorkOrderMaterialPlanResponse.from(plan);
    }

    @Transactional
    public void removePlan(
            Long currentUserId,
            Long workOrderId,
            Long planId
    ) {
        accessPolicy.requirePlanningActor(currentUserId);
        WorkOrder workOrder = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));

        requirePlanningOpen(workOrder);

        WorkOrderMaterialPlan plan = planRepository
                .findByIdAndWorkOrder_Id(planId, workOrderId)
                .orElseThrow(() -> notFound("No se encontró el material previsto."));

        Material material = plan.getMaterial();
        planRepository.delete(plan);
        planRepository.flush();

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.WORK_ORDER,
                workOrder.getId(),
                TraceabilityEventType.WORK_ORDER_MATERIAL_PLAN_REMOVED,
                workOrder.getStatus().name(),
                workOrder.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "materialId", material.getId(),
                        "materialCode", material.getCode(),
                        "materialName", material.getName(),
                        "plannedQuantity", plan.getPlannedQuantity(),
                        "unit", material.getUnit()
                )
        );
    }

    private void requirePlanningOpen(WorkOrder workOrder) {
        if (workOrder.getStatus() != WorkOrderStatus.CREATED
                && workOrder.getStatus() != WorkOrderStatus.READY_FOR_PRODUCTION) {
            conflict(
                    "El material previsto solo puede modificarse antes de iniciar Producción."
            );
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
}
