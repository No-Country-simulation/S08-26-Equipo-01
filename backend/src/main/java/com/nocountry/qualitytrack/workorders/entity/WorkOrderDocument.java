package com.nocountry.qualitytrack.workorders.entity;

import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
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
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "work_order_documents")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrderDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @Column(name = "case_id", nullable = false, updatable = false)
    private Long caseId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "document_version_id", nullable = false)
    private DocumentVersion documentVersion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "linked_by_user_id", nullable = false)
    private User linkedByUser;

    @Column(name = "linked_at", nullable = false)
    private Instant linkedAt;

    private WorkOrderDocument(
            WorkOrder workOrder,
            Document document,
            DocumentVersion documentVersion,
            User linkedByUser,
            Instant linkedAt
    ) {
        this.workOrder = Objects.requireNonNull(workOrder);
        this.caseId = Objects.requireNonNull(
                workOrder.getJobCase().getId(),
                "La orden de trabajo debe pertenecer a un expediente persistido."
        );
        this.document = Objects.requireNonNull(document);
        rebind(documentVersion, linkedByUser, linkedAt);
    }

    public static WorkOrderDocument pin(
            WorkOrder workOrder,
            Document document,
            DocumentVersion documentVersion,
            User linkedByUser,
            Instant linkedAt
    ) {
        return new WorkOrderDocument(
                workOrder,
                document,
                documentVersion,
                linkedByUser,
                linkedAt
        );
    }

    public void rebind(
            DocumentVersion documentVersion,
            User linkedByUser,
            Instant linkedAt
    ) {
        DocumentVersion version = Objects.requireNonNull(documentVersion);
        Long expectedDocumentId = document.getId();
        Long actualDocumentId = version.getDocument() == null
                ? null
                : version.getDocument().getId();

        if (expectedDocumentId == null || !expectedDocumentId.equals(actualDocumentId)) {
            throw new IllegalArgumentException(
                    "La versión seleccionada no pertenece al documento fijado."
            );
        }

        this.documentVersion = version;
        this.linkedByUser = Objects.requireNonNull(linkedByUser);
        this.linkedAt = Objects.requireNonNull(linkedAt);
    }
}
