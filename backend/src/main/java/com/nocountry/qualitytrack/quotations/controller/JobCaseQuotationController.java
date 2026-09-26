package com.nocountry.qualitytrack.quotations.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.quotations.documentation.CreateQuotationApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.QuotationApiDocs;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.service.QuotationWorkflowService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/job-cases/{caseId}/quotations")
@RequiredArgsConstructor
@QuotationApiDocs
public class JobCaseQuotationController {

    private final QuotationWorkflowService workflowService;

    @CreateQuotationApiDocs
    @PostMapping
    public ResponseEntity<ApiResponse<QuotationDetailResponse>> create(
            @CurrentUserId Long currentUserId,
            @PathVariable Long caseId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.QUOTATION_CREATED,
                        "Cotización creada correctamente.",
                        workflowService.create(currentUserId, caseId)
                ));
    }
}
