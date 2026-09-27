package com.nocountry.qualitytrack.workorders.dto.response;

import com.nocountry.qualitytrack.quotations.entity.Quotation;

import java.time.Instant;
import java.time.LocalDate;

public record WorkOrderAgreementResponse(
        Long quotationId,
        String quotationNumber,
        Integer revision,
        Instant approvedAt,
        LocalDate estimatedDeliveryDate
) {
    public static WorkOrderAgreementResponse from(Quotation quotation) {
        return new WorkOrderAgreementResponse(
                quotation.getId(),
                quotation.getQuotationNumber(),
                quotation.getRevision(),
                quotation.getApprovedAt(),
                quotation.getEstimatedDeliveryDate()
        );
    }
}
