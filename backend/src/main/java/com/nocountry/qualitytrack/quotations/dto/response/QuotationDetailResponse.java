package com.nocountry.qualitytrack.quotations.dto.response;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.users.entity.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record QuotationDetailResponse(
        Long id,
        Long caseId,
        String caseNumber,
        Long requestId,
        String requestNumber,
        Long customerId,
        String customerName,
        QuotationSourceResponse source,
        String quotationNumber,
        Integer revision,
        QuotationStatus status,
        String currency,
        BigDecimal subtotal,
        BigDecimal taxRate,
        BigDecimal tax,
        BigDecimal total,
        LocalDate validUntil,
        LocalDate estimatedDeliveryDate,
        String adjustmentNotes,
        String adjustmentResponse,
        Long createdByUserId,
        String createdByName,
        Instant sentAt,
        Instant approvedAt,
        Instant rejectedAt,
        String rejectionReason,
        Instant cancelledAt,
        String cancellationReason,
        Instant createdAt,
        Instant updatedAt,
        List<QuotationItemResponse> items
) {
    public static QuotationDetailResponse from(Quotation quotation) {
        return from(quotation, quotation.getStatus(), null);
    }

    public static QuotationDetailResponse from(
            Quotation quotation,
            QuotationSourceResponse source
    ) {
        return from(quotation, quotation.getStatus(), source);
    }

    public static QuotationDetailResponse from(
            Quotation quotation,
            QuotationStatus effectiveStatus
    ) {
        return from(quotation, effectiveStatus, null);
    }

    public static QuotationDetailResponse from(
            Quotation quotation,
            QuotationStatus effectiveStatus,
            QuotationSourceResponse source
    ) {
        return new QuotationDetailResponse(
                quotation.getId(),
                quotation.getJobCase().getId(),
                quotation.getJobCase().getCaseNumber(),
                quotation.getJobCase().getCustomerRequest().getId(),
                quotation.getJobCase().getCustomerRequest().getRequestNumber(),
                quotation.getJobCase().getCustomerRequest().getCustomer().getId(),
                quotation.getJobCase().getCustomerRequest().getCustomer().getName(),
                source,
                quotation.getQuotationNumber(),
                quotation.getRevision(),
                effectiveStatus,
                quotation.getCurrency(),
                quotation.getSubtotal(),
                quotation.getTaxRate(),
                quotation.getTax(),
                quotation.getTotal(),
                quotation.getValidUntil(),
                quotation.getEstimatedDeliveryDate(),
                quotation.getAdjustmentNotes(),
                quotation.getAdjustmentResponse(),
                quotation.getCreatedByUser().getId(),
                fullName(quotation.getCreatedByUser()),
                quotation.getSentAt(),
                quotation.getApprovedAt(),
                quotation.getRejectedAt(),
                quotation.getRejectionReason(),
                quotation.getCancelledAt(),
                quotation.getCancellationReason(),
                quotation.getCreatedAt(),
                quotation.getUpdatedAt(),
                quotation.getItems().stream().map(QuotationItemResponse::from).toList()
        );
    }

    private static String fullName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
