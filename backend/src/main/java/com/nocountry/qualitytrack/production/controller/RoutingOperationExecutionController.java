package com.nocountry.qualitytrack.production.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.production.documentation.ProductionApiDocs;
import com.nocountry.qualitytrack.production.documentation.StartOperationExecutionApiDocs;
import com.nocountry.qualitytrack.production.dto.request.StartOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.response.OperationExecutionResponse;
import com.nocountry.qualitytrack.production.service.ProductionWorkflowService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/routing-operations")
@RequiredArgsConstructor
@ProductionApiDocs
public class RoutingOperationExecutionController {

    private final ProductionWorkflowService productionWorkflowService;

    @StartOperationExecutionApiDocs
    @PostMapping("/{operationId}/executions")
    public ResponseEntity<ApiResponse<OperationExecutionResponse>> start(
            @CurrentUserId Long currentUserId,
            @PathVariable Long operationId,
            @Valid @RequestBody StartOperationExecutionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.OPERATION_EXECUTION_STARTED,
                        "Ejecución de operación iniciada.",
                        productionWorkflowService.start(currentUserId, operationId, request)
                ));
    }
}
