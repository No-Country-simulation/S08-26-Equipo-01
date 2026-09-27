package com.nocountry.qualitytrack.workorders.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import com.nocountry.qualitytrack.workorders.documentation.CreateWorkOrderApiDocs;
import com.nocountry.qualitytrack.workorders.documentation.WorkOrderApiDocs;
import com.nocountry.qualitytrack.workorders.dto.request.CreateWorkOrderRequest;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDetailResponse;
import com.nocountry.qualitytrack.workorders.service.WorkOrderWorkflowService;
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
@RequestMapping("/api/v1/job-cases/{caseId}/work-orders")
@RequiredArgsConstructor
@WorkOrderApiDocs
public class JobCaseWorkOrderController {

    private final WorkOrderWorkflowService workflowService;

    @CreateWorkOrderApiDocs
    @PostMapping
    public ResponseEntity<ApiResponse<WorkOrderDetailResponse>> create(
            @CurrentUserId Long currentUserId,
            @PathVariable Long caseId,
            @Valid @RequestBody CreateWorkOrderRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.WORK_ORDER_CREATED,
                        "Orden de trabajo creada correctamente.",
                        workflowService.create(currentUserId, caseId, request)
                ));
    }
}
