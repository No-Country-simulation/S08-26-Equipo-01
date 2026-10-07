package com.nocountry.qualitytrack.materials.dto.response;

import com.nocountry.qualitytrack.materials.entity.MaterialLot;

import java.math.BigDecimal;
import java.time.Instant;

public record MaterialLotResponse(
        Long id,
        Long materialId,
        String materialCode,
        String materialName,
        String lotNumber,
        String supplier,
        Instant receivedAt,
        BigDecimal quantityReceived,
        Long certificateDocumentId,
        Long certificateDocumentVersionId,
        String certificateFileName,
        Instant createdAt
) {
    public static MaterialLotResponse from(MaterialLot lot) {
        return new MaterialLotResponse(
                lot.getId(),
                lot.getMaterial().getId(),
                lot.getMaterial().getCode(),
                lot.getMaterial().getName(),
                lot.getLotNumber(),
                lot.getSupplier(),
                lot.getReceivedAt(),
                lot.getQuantityReceived(),
                lot.getCertificateDocumentVersion() == null
                        ? null
                        : lot.getCertificateDocumentVersion().getDocument().getId(),
                lot.getCertificateDocumentVersion() == null
                        ? null
                        : lot.getCertificateDocumentVersion().getId(),
                lot.getCertificateDocumentVersion() == null
                        ? null
                        : lot.getCertificateDocumentVersion().getFileName(),
                lot.getCreatedAt()
        );
    }
}
