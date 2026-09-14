package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;

import java.time.Instant;

public record JobCaseSummaryResponse(
        Long id,
        String caseNumber,
        JobCaseStatus status,
        String assignedToName,
        Instant assignedAt,
        Instant openedAt,
        Long cancelledByUserId,
        Instant cancelledAt,
        String cancellationReason
) {
    public static JobCaseSummaryResponse from(JobCase jobCase) {
        return new JobCaseSummaryResponse(
                jobCase.getId(),
                jobCase.getCaseNumber(),
                jobCase.getStatus(),
                jobCase.getAssignedToUser() == null
                        ? null
                        : fullName(
                                jobCase.getAssignedToUser().getFirstName(),
                                jobCase.getAssignedToUser().getLastName()
                        ),
                jobCase.getAssignedAt(),
                jobCase.getOpenedAt(),
                jobCase.getCancelledByUser() == null ? null : jobCase.getCancelledByUser().getId(),
                jobCase.getCancelledAt(),
                jobCase.getCancellationReason()
        );
    }

    private static String fullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
