package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;

import java.time.Instant;
import java.time.LocalDate;

public record JobCaseResponse(
        Long id,
        String caseNumber,
        JobCaseStatus status,
        Long assignedToUserId,
        String assignedToName,
        Instant assignedAt,
        Instant openedAt,
        Instant closedAt,
        Long cancelledByUserId,
        String cancelledByName,
        Instant cancelledAt,
        String cancellationReason,
        RequestSummary request
) {
    public static JobCaseResponse from(JobCase jobCase) {
        CustomerRequest request = jobCase.getCustomerRequest();

        return new JobCaseResponse(
                jobCase.getId(),
                jobCase.getCaseNumber(),
                jobCase.getStatus(),
                jobCase.getAssignedToUser() == null ? null : jobCase.getAssignedToUser().getId(),
                jobCase.getAssignedToUser() == null
                        ? null
                        : jobCase.getAssignedToUser().getFirstName() + " " + jobCase.getAssignedToUser().getLastName(),
                jobCase.getAssignedAt(),
                jobCase.getOpenedAt(),
                jobCase.getClosedAt(),
                jobCase.getCancelledByUser() == null ? null : jobCase.getCancelledByUser().getId(),
                jobCase.getCancelledByUser() == null
                        ? null
                        : jobCase.getCancelledByUser().getFirstName() + " " + jobCase.getCancelledByUser().getLastName(),
                jobCase.getCancelledAt(),
                jobCase.getCancellationReason(),
                RequestSummary.from(request)
        );
    }

    public record RequestSummary(
            Long id,
            Long customerId,
            String customerName,
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
            Instant submittedAt
    ) {
        private static RequestSummary from(CustomerRequest request) {
            return new RequestSummary(
                    request.getId(),
                    request.getCustomer().getId(),
                    request.getCustomer().getName(),
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
                    request.getCreatedAt()
            );
        }
    }
}
