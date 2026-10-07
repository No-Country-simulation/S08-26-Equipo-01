package com.nocountry.qualitytrack.materials.entity;

import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "material_lots")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MaterialLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "lot_number", nullable = false, length = 100)
    private String lotNumber;

    @Column
    private String supplier;

    @Column(name = "received_at", nullable = false)
    private Instant receivedAt;

    @Column(name = "quantity_received", nullable = false, precision = 14, scale = 3)
    private BigDecimal quantityReceived;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "certificate_document_version_id")
    private DocumentVersion certificateDocumentVersion;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    private MaterialLot(
            Material material,
            String lotNumber,
            String supplier,
            Instant receivedAt,
            BigDecimal quantityReceived,
            DocumentVersion certificateDocumentVersion
    ) {
        this.material = Objects.requireNonNull(material);
        this.lotNumber = requireText(lotNumber, "El número de lote es obligatorio.");
        this.supplier = normalizeOptional(supplier);
        this.receivedAt = Objects.requireNonNull(receivedAt);
        this.quantityReceived = requirePositive(
                quantityReceived,
                "La cantidad recibida del lote debe ser mayor a cero."
        );
        this.certificateDocumentVersion = certificateDocumentVersion;
    }

    public static MaterialLot create(
            Material material,
            String lotNumber,
            String supplier,
            Instant receivedAt,
            BigDecimal quantityReceived,
            DocumentVersion certificateDocumentVersion
    ) {
        return new MaterialLot(
                material,
                lotNumber,
                supplier,
                receivedAt,
                quantityReceived,
                certificateDocumentVersion
        );
    }

    public void attachCertificate(DocumentVersion certificateDocumentVersion) {
        DocumentVersion version = Objects.requireNonNull(certificateDocumentVersion);
        if (version.getDocument().getMaterialLot() == null
                || !Objects.equals(version.getDocument().getMaterialLot().getId(), id)) {
            throw new IllegalArgumentException(
                    "El certificado debe pertenecer al mismo lote de material."
            );
        }

        this.certificateDocumentVersion = version;
    }

    private static BigDecimal requirePositive(BigDecimal value, String message) {
        if (value == null || value.signum() <= 0) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private static String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
