package com.nocountry.qualitytrack.documents.entity;

import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.materials.entity.MaterialLot;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "documents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id")
    private JobCase jobCase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_lot_id")
    private MaterialLot materialLot;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.ACTIVE;

    @Column(name = "removed_at")
    private Instant removedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "removed_by_user_id")
    private User removedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    private Document(
            JobCase jobCase,
            MaterialLot materialLot,
            String documentType,
            String name,
            String description,
            User createdBy
    ) {
        if ((jobCase == null) == (materialLot == null)) {
            throw new IllegalArgumentException(
                    "El documento debe pertenecer exactamente a un expediente o a un lote."
            );
        }

        this.jobCase = jobCase;
        this.materialLot = materialLot;
        this.documentType = Objects.requireNonNull(documentType);
        this.name = Objects.requireNonNull(name);
        this.description = description;
        this.createdBy = Objects.requireNonNull(createdBy);
        this.status = DocumentStatus.ACTIVE;
    }

    public static Document create(
            JobCase jobCase,
            String documentType,
            String name,
            String description,
            User createdBy
    ) {
        return new Document(
                Objects.requireNonNull(jobCase),
                null,
                documentType,
                name,
                description,
                createdBy
        );
    }

    public static Document createForMaterialLot(
            MaterialLot materialLot,
            String documentType,
            String name,
            String description,
            User createdBy
    ) {
        return new Document(
                null,
                Objects.requireNonNull(materialLot),
                documentType,
                name,
                description,
                createdBy
        );
    }

    public void remove(User removedBy, Instant removedAt) {
        if (status == DocumentStatus.REMOVED) {
            return;
        }

        this.status = DocumentStatus.REMOVED;
        this.removedBy = Objects.requireNonNull(removedBy);
        this.removedAt = Objects.requireNonNull(removedAt);
    }

    public boolean isActive() {
        return status == DocumentStatus.ACTIVE;
    }

    public boolean belongsToCase() {
        return jobCase != null;
    }

    public boolean belongsToMaterialLot() {
        return materialLot != null;
    }
}
