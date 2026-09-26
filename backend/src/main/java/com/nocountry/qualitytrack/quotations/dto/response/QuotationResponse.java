package com.nocountry.qualitytrack.quotations.dto.response;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.users.entity.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record QuotationResponse(
        Long id,
        Long caseId,
        String caseNumber,
        Long requestId,
        String requestNumber,
        Long customerId,
        String customerName,
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
        Long createdByUserId,
        String createdByName,
        Instant sentAt,
        Instant approvedAt,
        Instant cancelledAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static QuotationResponse from(Quotation quotation) {
        return from(quotation, quotation.getStatus());
    }

    public static QuotationResponse from(
            Quotation quotation,
            QuotationStatus effectiveStatus
    ) {
        return new QuotationResponse(
                quotation.getId(),
                quotation.getJobCase().getId(),
                quotation.getJobCase().getCaseNumber(),
                quotation.getJobCase().getCustomerRequest().getId(),
                quotation.getJobCase().getCustomerRequest().getRequestNumber(),
                quotation.getJobCase().getCustomerRequest().getCustomer().getId(),
                quotation.getJobCase().getCustomerRequest().getCustomer().getName(),
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
                quotation.getCreatedByUser().getId(),
                fullName(quotation.getCreatedByUser()),
                quotation.getSentAt(),
                quotation.getApprovedAt(),
                quotation.getCancelledAt(),
                quotation.getCreatedAt(),
                quotation.getUpdatedAt()
        );
    }

    private static String fullName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
