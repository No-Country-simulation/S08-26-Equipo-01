package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record CustomerRequestDetailResponse(
        Long id,
        Long customerId,
        String requestNumber,
        String customerReference,
        String title,
        String description,
        Integer quantity,
        MaterialRequirementType materialRequirementType,
        String materialRequirement,
        LocalDate requestedDeliveryDate,
        Long requestedByUserId,
        String requestedByName,
        Instant createdAt,
        Instant updatedAt,
        JobCaseSummaryResponse jobCase,
        List<RequestDocumentResponse> documents
) {
    public static CustomerRequestDetailResponse from(
            CustomerRequestResponse request,
            List<RequestDocumentResponse> documents
    ) {
        return new CustomerRequestDetailResponse(
                request.id(),
                request.customerId(),
                request.requestNumber(),
                request.customerReference(),
                request.title(),
                request.description(),
                request.quantity(),
                request.materialRequirementType(),
                request.materialRequirement(),
                request.requestedDeliveryDate(),
                request.requestedByUserId(),
                request.requestedByName(),
                request.createdAt(),
                request.updatedAt(),
                request.jobCase(),
                documents
        );
    }
}
