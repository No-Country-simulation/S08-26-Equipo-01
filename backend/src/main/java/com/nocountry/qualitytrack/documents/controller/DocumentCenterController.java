package com.nocountry.qualitytrack.documents.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.documents.documentation.DocumentCenterApiDocs;
import com.nocountry.qualitytrack.documents.dto.response.DocumentCenterResponse;
import com.nocountry.qualitytrack.documents.enums.DocumentContext;
import com.nocountry.qualitytrack.documents.service.DocumentCenterService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Validated
@DocumentCenterApiDocs
public class DocumentCenterController {

    private final DocumentCenterService documentCenterService;

    @Operation(summary = "Consultar el centro documental con filtros operativos")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentCenterResponse>>> search(
            @CurrentUserId Long currentUserId,
            @RequestParam(required = false) @Positive Long customerId,
            @RequestParam(required = false) @Positive Long caseId,
            @RequestParam(required = false) @Positive Long workOrderId,
            @RequestParam(required = false) @Positive Long materialLotId,
            @RequestParam(required = false) @Positive Long deliveryId,
            @RequestParam(required = false) String documentType,
            @RequestParam(required = false) DocumentContext context
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DOCUMENTS_RETRIEVED,
                "Centro documental consultado correctamente.",
                documentCenterService.search(
                        currentUserId,
                        customerId,
                        caseId,
                        workOrderId,
                        materialLotId,
                        deliveryId,
                        documentType,
                        context
                )
        ));
    }
}
