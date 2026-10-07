package com.nocountry.qualitytrack.materials.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.materials.dto.request.UpsertWorkOrderMaterialPlanRequest;
import com.nocountry.qualitytrack.materials.dto.response.WorkOrderMaterialPlanResponse;
import com.nocountry.qualitytrack.materials.service.WorkOrderMaterialPlanningService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/work-orders")
@RequiredArgsConstructor
public class WorkOrderMaterialPlanningController {

    private final WorkOrderMaterialPlanningService planningService;

    @GetMapping("/{workOrderId}/material-plan")
    public ResponseEntity<ApiResponse<List<WorkOrderMaterialPlanResponse>>> listPlans(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_MATERIAL_PLANS_RETRIEVED,
                "Material previsto consultado correctamente.",
                planningService.listPlans(currentUserId, workOrderId)
        ));
    }

    @PostMapping("/{workOrderId}/material-plan")
    public ResponseEntity<ApiResponse<WorkOrderMaterialPlanResponse>> upsertPlan(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId,
            @Valid @RequestBody UpsertWorkOrderMaterialPlanRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_MATERIAL_PLAN_SAVED,
                "Material previsto guardado correctamente.",
                planningService.upsertPlan(currentUserId, workOrderId, request)
        ));
    }

    @DeleteMapping("/{workOrderId}/material-plan/{planId}")
    public ResponseEntity<Void> removePlan(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId,
            @PathVariable Long planId
    ) {
        planningService.removePlan(currentUserId, workOrderId, planId);
        return ResponseEntity.noContent().build();
    }
}
