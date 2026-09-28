package com.nocountry.qualitytrack.production.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.production.documentation.GetProductionStatusApiDocs;
import com.nocountry.qualitytrack.production.documentation.ProductionApiDocs;
import com.nocountry.qualitytrack.production.dto.response.ProductionStatusResponse;
import com.nocountry.qualitytrack.production.service.ProductionWorkflowService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/work-orders")
@RequiredArgsConstructor
@ProductionApiDocs
public class WorkOrderProductionController {

    private final ProductionWorkflowService productionWorkflowService;

    @GetProductionStatusApiDocs
    @GetMapping("/{workOrderId}/production")
    public ResponseEntity<ApiResponse<ProductionStatusResponse>> getStatus(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.PRODUCTION_RETRIEVED,
                "Estado de producción consultado correctamente.",
                productionWorkflowService.getStatus(currentUserId, workOrderId)
        ));
    }
}
