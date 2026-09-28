package com.nocountry.qualitytrack.quality.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.quality.documentation.CompleteQualityInspectionApiDocs;
import com.nocountry.qualitytrack.quality.documentation.GetQualityInspectionApiDocs;
import com.nocountry.qualitytrack.quality.documentation.QualityApiDocs;
import com.nocountry.qualitytrack.quality.documentation.SaveQualityMeasurementApiDocs;
import com.nocountry.qualitytrack.quality.documentation.StartQualityInspectionApiDocs;
import com.nocountry.qualitytrack.quality.dto.request.SaveQualityMeasurementRequest;
import com.nocountry.qualitytrack.quality.dto.request.StartQualityInspectionRequest;
import com.nocountry.qualitytrack.quality.dto.response.QualityInspectionResponse;
import com.nocountry.qualitytrack.quality.dto.response.QualityMeasurementResponse;
import com.nocountry.qualitytrack.quality.service.QualityWorkflowService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/quality-inspections")
@RequiredArgsConstructor
@QualityApiDocs
public class QualityInspectionController {

    private final QualityWorkflowService qualityWorkflowService;

    @GetQualityInspectionApiDocs
    @GetMapping("/{inspectionId}")
    public ResponseEntity<ApiResponse<QualityInspectionResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long inspectionId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUALITY_INSPECTION_RETRIEVED,
                "Inspección de Calidad consultada correctamente.",
                qualityWorkflowService.get(currentUserId, inspectionId)
        ));
    }

    @StartQualityInspectionApiDocs
    @PostMapping("/{inspectionId}/start")
    public ResponseEntity<ApiResponse<QualityInspectionResponse>> start(
            @CurrentUserId Long currentUserId,
            @PathVariable Long inspectionId,
            @Valid @RequestBody StartQualityInspectionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUALITY_INSPECTION_STARTED,
                "Inspección de Calidad iniciada.",
                qualityWorkflowService.start(currentUserId, inspectionId, request)
        ));
    }

    @SaveQualityMeasurementApiDocs
    @PostMapping("/{inspectionId}/measurements")
    public ResponseEntity<ApiResponse<QualityMeasurementResponse>> addMeasurement(
            @CurrentUserId Long currentUserId,
            @PathVariable Long inspectionId,
            @Valid @RequestBody SaveQualityMeasurementRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.QUALITY_MEASUREMENT_RECORDED,
                        "Medición registrada correctamente.",
                        qualityWorkflowService.addMeasurement(
                                currentUserId,
                                inspectionId,
                                request
                        )
                ));
    }

    @SaveQualityMeasurementApiDocs
    @PutMapping("/{inspectionId}/measurements/{measurementId}")
    public ResponseEntity<ApiResponse<QualityMeasurementResponse>> updateMeasurement(
            @CurrentUserId Long currentUserId,
            @PathVariable Long inspectionId,
            @PathVariable Long measurementId,
            @Valid @RequestBody SaveQualityMeasurementRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUALITY_MEASUREMENT_UPDATED,
                "Medición actualizada correctamente.",
                qualityWorkflowService.updateMeasurement(
                        currentUserId,
                        inspectionId,
                        measurementId,
                        request
                )
        ));
    }

    @CompleteQualityInspectionApiDocs
    @PostMapping("/{inspectionId}/complete")
    public ResponseEntity<ApiResponse<QualityInspectionResponse>> complete(
            @CurrentUserId Long currentUserId,
            @PathVariable Long inspectionId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUALITY_INSPECTION_COMPLETED,
                "Inspección de Calidad finalizada.",
                qualityWorkflowService.complete(currentUserId, inspectionId)
        ));
    }
}
