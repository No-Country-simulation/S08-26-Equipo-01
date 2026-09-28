package com.nocountry.qualitytrack.materials.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.materials.documentation.ListWorkOrderMaterialsApiDocs;
import com.nocountry.qualitytrack.materials.documentation.MaterialApiDocs;
import com.nocountry.qualitytrack.materials.documentation.RecordMaterialConsumptionApiDocs;
import com.nocountry.qualitytrack.materials.dto.request.RecordMaterialConsumptionRequest;
import com.nocountry.qualitytrack.materials.dto.response.WorkOrderMaterialResponse;
import com.nocountry.qualitytrack.materials.service.MaterialService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
@MaterialApiDocs
public class WorkOrderMaterialController {

    private final MaterialService materialService;

    @RecordMaterialConsumptionApiDocs
    @PostMapping("/{workOrderId}/materials")
    public ResponseEntity<ApiResponse<WorkOrderMaterialResponse>> recordConsumption(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId,
            @Valid @RequestBody RecordMaterialConsumptionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_MATERIAL_RECORDED,
                "Consumo de material registrado correctamente.",
                materialService.recordConsumption(currentUserId, workOrderId, request)
        ));
    }

    @ListWorkOrderMaterialsApiDocs
    @GetMapping("/{workOrderId}/materials")
    public ResponseEntity<ApiResponse<List<WorkOrderMaterialResponse>>> listConsumption(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_MATERIALS_RETRIEVED,
                "Consumo de materiales consultado correctamente.",
                materialService.listConsumption(currentUserId, workOrderId)
        ));
    }
}
