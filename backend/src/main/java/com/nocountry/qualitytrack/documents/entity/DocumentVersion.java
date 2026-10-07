package com.nocountry.qualitytrack.documents.entity;

import com.nocountry.qualitytrack.users.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(
        name = "document_versions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_document_versions_document_version",
                columnNames = {"document_id", "version"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DocumentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(nullable = false)
    private Integer version;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "storage_key", nullable = false, length = 500, unique = true)
    private String storageKey;

    @Column(name = "mime_type", nullable = false, length = 150)
    private String mimeType;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(nullable = false, length = 64)
    private String checksum;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by_user_id", nullable = false)
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private Instant uploadedAt;

    private DocumentVersion(
            Document document,
            Integer version,
            String fileName,
            String storageKey,
            String mimeType,
            Long fileSize,
            String checksum,
            User uploadedBy
    ) {
        this.document = Objects.requireNonNull(document);
        this.version = Objects.requireNonNull(version);
        this.fileName = Objects.requireNonNull(fileName);
        this.storageKey = Objects.requireNonNull(storageKey);
        this.mimeType = Objects.requireNonNull(mimeType);
        this.fileSize = fileSize;
        this.checksum = Objects.requireNonNull(checksum);
        this.uploadedBy = Objects.requireNonNull(uploadedBy);
    }

    public static DocumentVersion upload(
            Document document,
            Integer version,
            String fileName,
            String storageKey,
            String mimeType,
            Long fileSize,
            String checksum,
            User uploadedBy
    ) {
        if (version == null || version < 1) {
            throw new IllegalArgumentException("La versión del documento debe ser mayor que cero.");
        }

        return new DocumentVersion(
                document,
                version,
                fileName,
                storageKey,
                mimeType,
                fileSize,
                checksum,
                uploadedBy
        );
    }
}
