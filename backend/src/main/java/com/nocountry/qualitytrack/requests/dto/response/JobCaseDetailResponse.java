package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;

import java.time.Instant;
import java.util.List;

public record JobCaseDetailResponse(
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
        JobCaseResponse.RequestSummary request,
        List<RequestDocumentResponse> documents
) {
    public static JobCaseDetailResponse from(
            JobCaseResponse jobCase,
            List<RequestDocumentResponse> documents
    ) {
        return new JobCaseDetailResponse(
                jobCase.id(),
                jobCase.caseNumber(),
                jobCase.status(),
                jobCase.assignedToUserId(),
                jobCase.assignedToName(),
                jobCase.assignedAt(),
                jobCase.openedAt(),
                jobCase.closedAt(),
                jobCase.cancelledByUserId(),
                jobCase.cancelledByName(),
                jobCase.cancelledAt(),
                jobCase.cancellationReason(),
                jobCase.request(),
                documents
        );
    }
}
