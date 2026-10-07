package com.nocountry.qualitytrack.quality.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.quality.documentation.ListQualityInspectionsApiDocs;
import com.nocountry.qualitytrack.quality.documentation.QualityApiDocs;
import com.nocountry.qualitytrack.quality.documentation.QualityHandoffApiDocs;
import com.nocountry.qualitytrack.quality.dto.response.QualityInspectionResponse;
import com.nocountry.qualitytrack.quality.service.QualityWorkflowService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/work-orders")
@RequiredArgsConstructor
@QualityApiDocs
public class WorkOrderQualityController {

    private final QualityWorkflowService qualityWorkflowService;

    @QualityHandoffApiDocs
    @PostMapping("/{workOrderId}/quality-handoff")
    public ResponseEntity<ApiResponse<QualityInspectionResponse>> handoff(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.QUALITY_HANDOFF_COMPLETED,
                        "Orden enviada a Calidad correctamente.",
                        qualityWorkflowService.handoff(currentUserId, workOrderId)
                ));
    }

    @ListQualityInspectionsApiDocs
    @GetMapping("/{workOrderId}/quality-inspections")
    public ResponseEntity<ApiResponse<List<QualityInspectionResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUALITY_INSPECTIONS_RETRIEVED,
                "Inspecciones de Calidad consultadas correctamente.",
                qualityWorkflowService.list(currentUserId, workOrderId)
        ));
    }
}
