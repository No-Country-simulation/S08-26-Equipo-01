package com.nocountry.qualitytrack.quality.entity;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityDisposition;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.quality.enums.QualityInspectionStatus;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "quality_inspections")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QualityInspection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inspector_user_id")
    private User inspector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rework_non_conformity_id")
    private NonConformity reworkNonConformity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QualityInspectionStatus status;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private QualityInspection(
            WorkOrder workOrder,
            NonConformity reworkNonConformity
    ) {
        this.workOrder = Objects.requireNonNull(workOrder);
        this.reworkNonConformity = reworkNonConformity;

        if (reworkNonConformity == null) {
            if (workOrder.getStatus() != WorkOrderStatus.IN_PRODUCTION
                    || !workOrder.isProductionCompleted()) {
                throw new IllegalStateException(
                        "La orden debe tener la producción completa antes de crear la inspección."
                );
            }
        } else {
            if (workOrder.getStatus() != WorkOrderStatus.REWORK_IN_PROGRESS) {
                throw new IllegalStateException(
                        "La orden debe estar REWORK_IN_PROGRESS para crear una reinspección."
                );
            }
            if (reworkNonConformity.getStatus() != NonConformityStatus.OPEN
                    || reworkNonConformity.getDisposition() != NonConformityDisposition.REWORK) {
                throw new IllegalStateException(
                        "La reinspección requiere una no conformidad OPEN con disposición REWORK."
                );
            }
            WorkOrder ncWorkOrder = reworkNonConformity.getWorkOrder();
            if (ncWorkOrder != workOrder
                    && (
                    ncWorkOrder.getId() == null
                            || workOrder.getId() == null
                            || !ncWorkOrder.getId().equals(workOrder.getId())
            )) {
                throw new IllegalArgumentException(
                        "La no conformidad no pertenece a la orden de trabajo de la reinspección."
                );
            }
        }

        this.status = QualityInspectionStatus.PENDING;
    }

    public static QualityInspection createPending(WorkOrder workOrder) {
        return new QualityInspection(workOrder, null);
    }

    public static QualityInspection createReinspection(
            WorkOrder workOrder,
            NonConformity nonConformity
    ) {
        return new QualityInspection(
                workOrder,
                Objects.requireNonNull(nonConformity)
        );
    }

    public void start(User inspector, Instant startedAt) {
        if (status != QualityInspectionStatus.PENDING) {
            throw new IllegalStateException(
                    "Solo una inspección PENDING puede iniciarse."
            );
        }
        this.inspector = Objects.requireNonNull(inspector);
        this.startedAt = Objects.requireNonNull(startedAt);
        this.status = QualityInspectionStatus.IN_PROGRESS;
    }

    public void approve(Instant completedAt) {
        complete(QualityInspectionStatus.APPROVED, completedAt);
    }

    public void reject(Instant completedAt) {
        complete(QualityInspectionStatus.REJECTED, completedAt);
    }

    public boolean isInProgress() {
        return status == QualityInspectionStatus.IN_PROGRESS;
    }

    private void complete(QualityInspectionStatus finalStatus, Instant completedAt) {
        if (status != QualityInspectionStatus.IN_PROGRESS) {
            throw new IllegalStateException(
                    "Solo una inspección IN_PROGRESS puede finalizarse."
            );
        }

        Instant nextCompletedAt = Objects.requireNonNull(completedAt);
        if (nextCompletedAt.isBefore(startedAt)) {
            throw new IllegalArgumentException(
                    "La finalización no puede ser anterior al inicio de la inspección."
            );
        }

        this.completedAt = nextCompletedAt;
        this.status = finalStatus;
    }
}
