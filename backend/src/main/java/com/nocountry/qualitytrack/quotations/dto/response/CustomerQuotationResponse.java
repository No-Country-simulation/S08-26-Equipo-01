package com.nocountry.qualitytrack.quotations.dto.response;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.CustomerQuotationStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record CustomerQuotationResponse(
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
        Instant sentAt,
        Instant approvedAt,
        Instant rejectedAt,
        Instant cancelledAt
) {
    public static CustomerQuotationResponse from(
            Quotation quotation,
            CustomerQuotationStatus customerStatus
    ) {
        return new CustomerQuotationResponse(
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
                quotation.getSentAt(),
                quotation.getApprovedAt(),
                quotation.getRejectedAt(),
                quotation.getCancelledAt()
        );
    }
}
