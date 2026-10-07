package com.nocountry.qualitytrack.workorders.dto.response;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;

import java.time.Instant;
import java.time.LocalDate;

public record PendingWorkOrderResponse(
        Long caseId,
        String caseNumber,
        Long requestId,
        String requestNumber,
        String requestTitle,
        Long customerId,
        String customerName,
        Integer quantity,
        Long quotationId,
        String quotationNumber,
        Integer quotationRevision,
        Instant approvedAt,
        LocalDate estimatedDeliveryDate
) {
    public static PendingWorkOrderResponse from(Quotation quotation) {
        CustomerRequest request = quotation.getJobCase().getCustomerRequest();

        return new PendingWorkOrderResponse(
                quotation.getJobCase().getId(),
                quotation.getJobCase().getCaseNumber(),
                request.getId(),
                request.getRequestNumber(),
                request.getTitle(),
                request.getCustomer().getId(),
                request.getCustomer().getName(),
                request.getQuantity(),
                quotation.getId(),
                quotation.getQuotationNumber(),
                quotation.getRevision(),
                quotation.getApprovedAt(),
                quotation.getEstimatedDeliveryDate()
        );
    }
}
