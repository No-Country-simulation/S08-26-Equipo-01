package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;

import java.time.Instant;

public record RequestDocumentResponse(
        Long id,
        String documentType,
        String name,
        String description,
        Long createdByUserId,
        String createdByName,
        Instant createdAt,
        RequestDocumentVersionResponse currentVersion
) {
    public static RequestDocumentResponse from(
            DocumentResponse document,
            Long customerId,
            Long requestId
    ) {
        return new RequestDocumentResponse(
                document.id(),
                document.documentType(),
                document.name(),
                document.description(),
                document.createdByUserId(),
                document.createdByName(),
                document.createdAt(),
                RequestDocumentVersionResponse.from(
                        document.currentVersion(),
                        customerId,
                        requestId,
                        document.id()
                )
        );
    }
}
