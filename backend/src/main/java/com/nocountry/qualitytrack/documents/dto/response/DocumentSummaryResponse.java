package com.nocountry.qualitytrack.documents.dto.response;

import com.nocountry.qualitytrack.documents.entity.Document;

import java.time.Instant;

public record DocumentSummaryResponse(
        Long id,
        Long caseId,
        String documentType,
        String name,
        String description,
        Long createdByUserId,
        String createdByName,
        Instant createdAt
) {
    public static DocumentSummaryResponse from(Document document) {
        return new DocumentSummaryResponse(
                document.getId(),
                document.getJobCase() == null ? null : document.getJobCase().getId(),
                document.getDocumentType(),
                document.getName(),
                document.getDescription(),
                document.getCreatedBy().getId(),
                fullName(document.getCreatedBy().getFirstName(), document.getCreatedBy().getLastName()),
                document.getCreatedAt()
        );
    }

    private static String fullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (first + " " + last).trim();
    }
}
