package com.nocountry.qualitytrack.documents.dto.response;

import com.nocountry.qualitytrack.documents.entity.DocumentVersion;

import java.time.Instant;

public record DocumentVersionResponse(
        Long id,
        Integer version,
        String fileName,
        String mimeType,
        Long fileSize,
        String checksum,
        Long uploadedByUserId,
        String uploadedByName,
        Instant uploadedAt
) {
    public static DocumentVersionResponse from(DocumentVersion version) {
        return new DocumentVersionResponse(
                version.getId(),
                version.getVersion(),
                version.getFileName(),
                version.getMimeType(),
                version.getFileSize(),
                version.getChecksum(),
                version.getUploadedBy().getId(),
                fullName(version.getUploadedBy().getFirstName(), version.getUploadedBy().getLastName()),
                version.getUploadedAt()
        );
    }

    private static String fullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (first + " " + last).trim();
    }
}
