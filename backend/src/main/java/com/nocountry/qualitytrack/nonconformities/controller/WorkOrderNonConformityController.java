package com.nocountry.qualitytrack.nonconformities.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.nonconformities.documentation.NonConformityApiDocs;
import com.nocountry.qualitytrack.nonconformities.dto.response.NonConformityResponse;
import com.nocountry.qualitytrack.nonconformities.service.NonConformityService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/work-orders/{workOrderId}/non-conformities")
@RequiredArgsConstructor
@NonConformityApiDocs
public class WorkOrderNonConformityController {

    private final NonConformityService nonConformityService;

    @Operation(summary = "Listar no conformidades de una OT")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NonConformityResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.NON_CONFORMITIES_RETRIEVED,
                "No conformidades consultadas correctamente.",
                nonConformityService.listByWorkOrder(currentUserId, workOrderId)
        ));
    }
}
