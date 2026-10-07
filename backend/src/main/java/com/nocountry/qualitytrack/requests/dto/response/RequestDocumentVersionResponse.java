package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;

import java.time.Instant;

public record RequestDocumentVersionResponse(
        Long id,
        Integer version,
        String fileName,
        String mimeType,
        Long fileSize,
        String checksum,
        Long uploadedByUserId,
        String uploadedByName,
        Instant uploadedAt,
        String contentUrl,
        String downloadUrl
) {
    public static RequestDocumentVersionResponse from(
            DocumentVersionResponse version,
            Long customerId,
            Long requestId,
            Long documentId
    ) {
        String contentUrl = "/api/v1/customers/%d/requests/%d/documents/%d/versions/%d/content"
                .formatted(customerId, requestId, documentId, version.id());

        return new RequestDocumentVersionResponse(
                version.id(),
                version.version(),
                version.fileName(),
                version.mimeType(),
                version.fileSize(),
                version.checksum(),
                version.uploadedByUserId(),
                version.uploadedByName(),
                version.uploadedAt(),
                contentUrl,
                contentUrl + "?download=true"
        );
    }
}
