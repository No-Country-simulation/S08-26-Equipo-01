package com.nocountry.qualitytrack.quotations.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.quotations.documentation.CancelQuotationApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.CreateQuotationRevisionApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.GetQuotationApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.ListQuotationRevisionsApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.ListQuotationsApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.QuotationApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.SendQuotationApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.UpdateQuotationApiDocs;
import com.nocountry.qualitytrack.quotations.dto.request.CancelQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.request.SendQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.request.UpdateQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationResponse;
import com.nocountry.qualitytrack.quotations.service.QuotationService;
import com.nocountry.qualitytrack.quotations.service.QuotationWorkflowService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quotations")
@RequiredArgsConstructor
@QuotationApiDocs
public class QuotationController {

    private final QuotationService quotationService;
    private final QuotationWorkflowService workflowService;

    @ListQuotationsApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<QuotationResponse>>> list(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATIONS_RETRIEVED,
                "Cotizaciones consultadas correctamente.",
                quotationService.listInternal(currentUserId)
        ));
    }

    @ListQuotationRevisionsApiDocs
    @GetMapping("/{quotationId}/revisions")
    public ResponseEntity<ApiResponse<List<QuotationResponse>>> revisions(
            @CurrentUserId Long currentUserId,
            @PathVariable Long quotationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATIONS_RETRIEVED,
                "Historial de revisiones consultado correctamente.",
                quotationService.listRevisionsInternal(currentUserId, quotationId)
        ));
    }

    @GetQuotationApiDocs
    @GetMapping("/{quotationId}")
    public ResponseEntity<ApiResponse<QuotationDetailResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long quotationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATION_RETRIEVED,
                "Cotización consultada correctamente.",
                quotationService.getInternal(currentUserId, quotationId)
        ));
    }

    @UpdateQuotationApiDocs
    @PutMapping("/{quotationId}")
    public ResponseEntity<ApiResponse<QuotationDetailResponse>> update(
            @CurrentUserId Long currentUserId,
            @PathVariable Long quotationId,
            @Valid @RequestBody UpdateQuotationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATION_UPDATED,
                "Cotización actualizada correctamente.",
                workflowService.update(currentUserId, quotationId, request)
        ));
    }

    @SendQuotationApiDocs
    @PostMapping("/{quotationId}/send")
    public ResponseEntity<ApiResponse<QuotationDetailResponse>> send(
            @CurrentUserId Long currentUserId,
            @PathVariable Long quotationId,
            @Valid @RequestBody(required = false) SendQuotationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATION_SENT,
                "Cotización enviada al cliente correctamente.",
                workflowService.send(currentUserId, quotationId, request)
        ));
    }

    @CreateQuotationRevisionApiDocs
    @PostMapping("/{quotationId}/revisions")
    public ResponseEntity<ApiResponse<QuotationDetailResponse>> createRevision(
            @CurrentUserId Long currentUserId,
            @PathVariable Long quotationId
    ) {
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.QUOTATION_REVISION_CREATED,
                        "Nueva revisión de cotización creada correctamente.",
                        workflowService.createRevision(currentUserId, quotationId)
                ));
    }

    @CancelQuotationApiDocs
    @PostMapping("/{quotationId}/cancel")
    public ResponseEntity<ApiResponse<QuotationDetailResponse>> cancel(
            @CurrentUserId Long currentUserId,
            @PathVariable Long quotationId,
            @Valid @RequestBody CancelQuotationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATION_CANCELLED,
                "Cotización cancelada correctamente.",
                workflowService.cancel(currentUserId, quotationId, request)
        ));
    }
}
