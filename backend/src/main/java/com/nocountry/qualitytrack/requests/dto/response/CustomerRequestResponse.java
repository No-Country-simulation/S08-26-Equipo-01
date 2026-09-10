package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;

import java.time.Instant;
import java.time.LocalDate;

public record CustomerRequestResponse(
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
        JobCaseSummaryResponse jobCase
) {
    public static CustomerRequestResponse from(CustomerRequest request, JobCase jobCase) {
        return new CustomerRequestResponse(
                request.getId(),
                request.getCustomer().getId(),
                request.getRequestNumber(),
                request.getCustomerReference(),
                request.getTitle(),
                request.getDescription(),
                request.getQuantity(),
                request.getMaterialRequirementType(),
                request.getMaterialRequirement(),
                request.getRequestedDeliveryDate(),
                request.getRequestedByUser().getId(),
                request.getRequestedByUser().getFirstName() + " " + request.getRequestedByUser().getLastName(),
                request.getCreatedAt(),
                request.getUpdatedAt(),
                JobCaseSummaryResponse.from(jobCase)
        );
    }
}
