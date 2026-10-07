package com.nocountry.qualitytrack.documents.dto.response;

import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;

import java.time.Instant;

public record DocumentResponse(
        Long id,
        Long caseId,
        String documentType,
        String name,
        String description,
        Long createdByUserId,
        String createdByName,
        Instant createdAt,
        DocumentVersionResponse currentVersion
) {
    public static DocumentResponse from(Document document, DocumentVersion currentVersion) {
        return new DocumentResponse(
                document.getId(),
                document.getJobCase() == null ? null : document.getJobCase().getId(),
                document.getDocumentType(),
                document.getName(),
                document.getDescription(),
                document.getCreatedBy().getId(),
                fullName(document.getCreatedBy().getFirstName(), document.getCreatedBy().getLastName()),
                document.getCreatedAt(),
                DocumentVersionResponse.from(currentVersion)
        );
    }

    private static String fullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (first + " " + last).trim();
    }
}
