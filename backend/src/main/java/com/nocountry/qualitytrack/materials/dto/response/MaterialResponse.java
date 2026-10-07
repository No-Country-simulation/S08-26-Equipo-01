package com.nocountry.qualitytrack.materials.dto.response;

import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.materials.entity.Material;

import java.time.Instant;

public record MaterialResponse(
        Long id,
        String code,
        String name,
        String specification,
        String unit,
        Long technicalSheetDocumentId,
        Long technicalSheetDocumentVersionId,
        String technicalSheetFileName,
        Instant createdAt,
        Instant updatedAt
) {
    public static MaterialResponse from(Material material) {
        DocumentVersion technicalSheet = material.getTechnicalSheetDocumentVersion();
        return new MaterialResponse(
                material.getId(),
                material.getCode(),
                material.getName(),
                material.getSpecification(),
                material.getUnit(),
                technicalSheet == null ? null : technicalSheet.getDocument().getId(),
                technicalSheet == null ? null : technicalSheet.getId(),
                technicalSheet == null ? null : technicalSheet.getFileName(),
                material.getCreatedAt(),
                material.getUpdatedAt()
        );
    }
}
