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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "materials")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column
    private String specification;

    @Column(nullable = false, length = 20)
    private String unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technical_sheet_document_version_id")
    private DocumentVersion technicalSheetDocumentVersion;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private Material(String code, String name, String specification, String unit) {
        this.code = requireText(code, "El código de material es obligatorio.").toUpperCase();
        this.name = requireText(name, "El nombre del material es obligatorio.");
        this.specification = normalizeOptional(specification);
        this.unit = requireText(unit, "La unidad del material es obligatoria.").toUpperCase();
    }

    public static Material create(String code, String name, String specification, String unit) {
        return new Material(code, name, specification, unit);
    }

    public void attachTechnicalSheet(DocumentVersion technicalSheetDocumentVersion) {
        DocumentVersion version = Objects.requireNonNull(technicalSheetDocumentVersion);
        if (version.getDocument().getMaterial() == null
                || !Objects.equals(version.getDocument().getMaterial().getId(), id)) {
            throw new IllegalArgumentException(
                    "La ficha técnica debe pertenecer al mismo material."
            );
        }
        this.technicalSheetDocumentVersion = version;
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
