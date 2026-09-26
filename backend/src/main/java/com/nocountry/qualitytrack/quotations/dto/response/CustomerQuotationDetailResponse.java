package com.nocountry.qualitytrack.quotations.dto.response;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.CustomerQuotationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record CustomerQuotationDetailResponse(
        Long id,
        String caseNumber,
        String requestNumber,
        String quotationNumber,
        Integer revision,
        CustomerQuotationStatus customerStatus,
        String currency,
        BigDecimal subtotal,
        BigDecimal taxRate,
        BigDecimal tax,
        BigDecimal total,
        LocalDate validUntil,
        LocalDate estimatedDeliveryDate,
        CustomerQuotationAdjustmentResponse adjustment,
        Instant sentAt,
        Instant approvedAt,
        Instant rejectedAt,
        String rejectionReason,
        Instant cancelledAt,
        String cancellationReason,
        List<QuotationItemResponse> items
) {
    public static CustomerQuotationDetailResponse from(Quotation quotation) {
        return from(
                quotation,
                CustomerQuotationStatus.fromDomain(quotation.getStatus(), false),
                quotation.getAdjustmentNotes(),
                quotation.getAdjustmentResponse()
        );
    }

    public static CustomerQuotationDetailResponse from(
            Quotation quotation,
            CustomerQuotationStatus customerStatus,
            String adjustmentNotes,
            String adjustmentResponse
    ) {
        return new CustomerQuotationDetailResponse(
                quotation.getId(),
                quotation.getJobCase().getCaseNumber(),
                quotation.getJobCase().getCustomerRequest().getRequestNumber(),
                quotation.getQuotationNumber(),
                quotation.getRevision(),
                customerStatus,
                quotation.getCurrency(),
                quotation.getSubtotal(),
                quotation.getTaxRate(),
                quotation.getTax(),
                quotation.getTotal(),
                quotation.getValidUntil(),
                quotation.getEstimatedDeliveryDate(),
                CustomerQuotationAdjustmentResponse.of(adjustmentNotes, adjustmentResponse),
                quotation.getSentAt(),
                quotation.getApprovedAt(),
                quotation.getRejectedAt(),
                quotation.getRejectionReason(),
                quotation.getCancelledAt(),
                quotation.getCancellationReason(),
                quotation.getItems().stream().map(QuotationItemResponse::from).toList()
        );
    }
}
