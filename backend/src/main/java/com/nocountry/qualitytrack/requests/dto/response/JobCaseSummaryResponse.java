package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;

import java.time.Instant;

public record JobCaseSummaryResponse(
        Long id,
        String caseNumber,
        JobCaseStatus status,
        Long assignedToUserId,
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
                jobCase.getAssignedToUser() == null ? null : jobCase.getAssignedToUser().getId(),
                jobCase.getAssignedAt(),
                jobCase.getOpenedAt(),
                jobCase.getCancelledByUser() == null ? null : jobCase.getCancelledByUser().getId(),
                jobCase.getCancelledAt(),
                jobCase.getCancellationReason()
        );
    }
}
