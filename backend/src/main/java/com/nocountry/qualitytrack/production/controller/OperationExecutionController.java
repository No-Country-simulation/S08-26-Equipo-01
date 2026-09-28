package com.nocountry.qualitytrack.production.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.production.documentation.CancelOperationExecutionApiDocs;
import com.nocountry.qualitytrack.production.documentation.CompleteOperationExecutionApiDocs;
import com.nocountry.qualitytrack.production.documentation.ProductionApiDocs;
import com.nocountry.qualitytrack.production.dto.request.CancelOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.request.CompleteOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.response.OperationExecutionResponse;
import com.nocountry.qualitytrack.production.service.ProductionWorkflowService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/operation-executions")
@RequiredArgsConstructor
@ProductionApiDocs
public class OperationExecutionController {

    private final ProductionWorkflowService productionWorkflowService;

    @CompleteOperationExecutionApiDocs
    @PostMapping("/{executionId}/complete")
    public ResponseEntity<ApiResponse<OperationExecutionResponse>> complete(
            @CurrentUserId Long currentUserId,
            @PathVariable Long executionId,
            @Valid @RequestBody CompleteOperationExecutionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.OPERATION_EXECUTION_COMPLETED,
                "Ejecución completada correctamente.",
                productionWorkflowService.complete(currentUserId, executionId, request)
        ));
    }

    @CancelOperationExecutionApiDocs
    @PostMapping("/{executionId}/cancel")
    public ResponseEntity<ApiResponse<OperationExecutionResponse>> cancel(
            @CurrentUserId Long currentUserId,
            @PathVariable Long executionId,
            @Valid @RequestBody CancelOperationExecutionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.OPERATION_EXECUTION_CANCELLED,
                "Ejecución cancelada correctamente.",
                productionWorkflowService.cancel(currentUserId, executionId, request)
        ));
    }
}
