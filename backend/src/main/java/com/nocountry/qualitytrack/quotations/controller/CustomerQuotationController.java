package com.nocountry.qualitytrack.quotations.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.quotations.documentation.ApproveQuotationApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.GetCustomerQuotationApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.ListCustomerQuotationRevisionsApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.ListCustomerQuotationsApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.QuotationApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.RejectQuotationApiDocs;
import com.nocountry.qualitytrack.quotations.documentation.RequestQuotationAdjustmentApiDocs;
import com.nocountry.qualitytrack.quotations.dto.request.RejectQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.request.RequestQuotationAdjustmentRequest;
import com.nocountry.qualitytrack.quotations.dto.response.CustomerQuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.dto.response.CustomerQuotationResponse;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/{customerId}/quotations")
@RequiredArgsConstructor
@QuotationApiDocs
public class CustomerQuotationController {

    private final QuotationService quotationService;
    private final QuotationWorkflowService workflowService;

    @ListCustomerQuotationsApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerQuotationResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATIONS_RETRIEVED,
                "Cotizaciones consultadas correctamente.",
                quotationService.listForCustomer(currentUserId, customerId)
        ));
    }

    @ListCustomerQuotationRevisionsApiDocs
    @GetMapping("/{quotationId}/revisions")
    public ResponseEntity<ApiResponse<List<CustomerQuotationResponse>>> revisions(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long quotationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATIONS_RETRIEVED,
                "Historial de revisiones de la cotización consultado correctamente.",
                quotationService.listRevisionsForCustomer(currentUserId, customerId, quotationId)
        ));
    }

    @GetCustomerQuotationApiDocs
    @GetMapping("/{quotationId}")
    public ResponseEntity<ApiResponse<CustomerQuotationDetailResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long quotationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATION_RETRIEVED,
                "Cotización consultada correctamente.",
                quotationService.getForCustomer(currentUserId, customerId, quotationId)
        ));
    }

    @ApproveQuotationApiDocs
    @PostMapping("/{quotationId}/approve")
    public ResponseEntity<ApiResponse<CustomerQuotationDetailResponse>> approve(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long quotationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATION_APPROVED,
                "Cotización aprobada correctamente.",
                workflowService.approve(currentUserId, customerId, quotationId)
        ));
    }

    @RejectQuotationApiDocs
    @PostMapping("/{quotationId}/reject")
    public ResponseEntity<ApiResponse<CustomerQuotationDetailResponse>> reject(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long quotationId,
            @Valid @RequestBody(required = false) RejectQuotationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATION_REJECTED,
                "Cotización rechazada correctamente.",
                workflowService.reject(currentUserId, customerId, quotationId, request)
        ));
    }

    @RequestQuotationAdjustmentApiDocs
    @PostMapping("/{quotationId}/request-adjustment")
    public ResponseEntity<ApiResponse<CustomerQuotationDetailResponse>> requestAdjustment(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long quotationId,
            @Valid @RequestBody RequestQuotationAdjustmentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.QUOTATION_ADJUSTMENT_REQUESTED,
                "Solicitud de ajuste registrada correctamente.",
                workflowService.requestAdjustment(
                        currentUserId,
                        customerId,
                        quotationId,
                        request
                )
        ));
    }
}
