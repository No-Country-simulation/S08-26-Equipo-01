package com.nocountry.qualitytrack.workorders.dto.response;

import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrderDocument;

import java.time.Instant;

public record WorkOrderDocumentResponse(
        Long id,
        Long documentId,
        String documentName,
        String documentType,
        Long documentVersionId,
        Integer version,
        String fileName,
        String mimeType,
        Long fileSize,
        String checksum,
        Long linkedByUserId,
        String linkedByName,
        Instant linkedAt
) {
    public static WorkOrderDocumentResponse from(WorkOrderDocument link) {
        User linkedBy = link.getLinkedByUser();
        return new WorkOrderDocumentResponse(
                link.getId(),
                link.getDocument().getId(),
                link.getDocument().getName(),
                link.getDocument().getDocumentType(),
                link.getDocumentVersion().getId(),
                link.getDocumentVersion().getVersion(),
                link.getDocumentVersion().getFileName(),
                link.getDocumentVersion().getMimeType(),
                link.getDocumentVersion().getFileSize(),
                link.getDocumentVersion().getChecksum(),
                linkedBy.getId(),
                fullName(linkedBy),
                link.getLinkedAt()
        );
    }

    private static String fullName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
