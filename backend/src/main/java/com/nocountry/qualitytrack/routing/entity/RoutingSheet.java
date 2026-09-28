package com.nocountry.qualitytrack.routing.entity;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityDisposition;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.enums.RoutingSheetStatus;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Entity
@Table(name = "routing_sheets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoutingSheet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @Column(nullable = false)
    private Integer revision;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoutingPurpose purpose;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoutingSheetStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "non_conformity_id")
    private NonConformity nonConformity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_user_id")
    private User approvedByUser;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "released_by_user_id")
    private User releasedByUser;

    @Column(name = "released_at")
    private Instant releasedAt;

    @OneToMany(
            mappedBy = "routingSheet",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("sequenceNumber ASC")
    private List<RoutingOperation> operations = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private RoutingSheet(
            WorkOrder workOrder,
            Integer revision,
            RoutingPurpose purpose,
            NonConformity nonConformity,
            User createdByUser
    ) {
        this.workOrder = Objects.requireNonNull(workOrder);
        this.revision = requirePositive(revision, "La revisión de routing debe ser mayor a cero.");
        this.purpose = Objects.requireNonNull(purpose);
        this.nonConformity = nonConformity;
        this.createdByUser = Objects.requireNonNull(createdByUser);
        this.status = RoutingSheetStatus.DRAFT;
        requireWorkOrderAllowsRouting();
    }

    public static RoutingSheet createProduction(
            WorkOrder workOrder,
            User createdByUser
    ) {
        return new RoutingSheet(
                workOrder,
                1,
                RoutingPurpose.PRODUCTION,
                null,
                createdByUser
        );
    }

    public static RoutingSheet createRework(
            WorkOrder workOrder,
            Integer revision,
            NonConformity nonConformity,
            User createdByUser
    ) {
        return new RoutingSheet(
                workOrder,
                revision,
                RoutingPurpose.REWORK,
                Objects.requireNonNull(nonConformity),
                createdByUser
        );
    }

    public RoutingOperation addOperation(
            Integer sequenceNumber,
            String code,
            String name,
            String instructions,
            Integer estimatedMinutes
    ) {
        requireEditable();
        requireSequenceAvailable(sequenceNumber, null);

        RoutingOperation operation = RoutingOperation.create(
                this,
                sequenceNumber,
                code,
                name,
                instructions,
                estimatedMinutes
        );
        operations.add(operation);
        touch();
        return operation;
    }

    public RoutingOperation updateOperation(
            Long operationId,
            Integer sequenceNumber,
            String code,
            String name,
            String instructions,
            Integer estimatedMinutes
    ) {
        requireEditable();
        RoutingOperation operation = findOperation(operationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se encontró la operación dentro de la hoja de ruta."
                ));
        requireSequenceAvailable(sequenceNumber, operation.getId());
        operation.update(sequenceNumber, code, name, instructions, estimatedMinutes);
        touch();
        return operation;
    }

    public void removeOperation(Long operationId) {
        requireEditable();
        RoutingOperation operation = findOperation(operationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No se encontró la operación dentro de la hoja de ruta."
                ));
        operations.remove(operation);
        touch();
    }

    public Optional<RoutingOperation> findOperation(Long operationId) {
        return operations.stream()
                .filter(operation -> Objects.equals(operation.getId(), operationId))
                .findFirst();
    }

    public void approve(User actor, Instant approvedAt) {
        requireWorkOrderAllowsRouting();
        requireStatus(
                RoutingSheetStatus.DRAFT,
                "Solo una hoja de ruta DRAFT puede aprobarse."
        );
        if (operations.isEmpty()) {
            throw new IllegalStateException(
                    "La hoja de ruta necesita al menos una operación antes de aprobarse."
            );
        }
        this.approvedByUser = Objects.requireNonNull(actor);
        this.approvedAt = Objects.requireNonNull(approvedAt);
        this.status = RoutingSheetStatus.APPROVED;
    }

    public void reopen() {
        requireWorkOrderAllowsRouting();
        requireStatus(
                RoutingSheetStatus.APPROVED,
                "Solo una hoja de ruta APPROVED puede reabrirse."
        );
        this.approvedByUser = null;
        this.approvedAt = null;
        this.status = RoutingSheetStatus.DRAFT;
        touch();
    }

    public void release(User actor, Instant releasedAt) {
        requireWorkOrderAllowsRouting();
        requireStatus(
                RoutingSheetStatus.APPROVED,
                "Solo una hoja de ruta APPROVED puede liberarse."
        );
        if (operations.isEmpty()) {
            throw new IllegalStateException(
                    "La hoja de ruta necesita operaciones antes de liberarse."
            );
        }
        this.releasedByUser = Objects.requireNonNull(actor);
        this.releasedAt = Objects.requireNonNull(releasedAt);
        this.status = RoutingSheetStatus.RELEASED;
    }

    public int totalEstimatedMinutes() {
        return operations.stream()
                .mapToInt(RoutingOperation::getEstimatedMinutes)
                .sum();
    }

    private void touch() {
        this.updatedAt = Instant.now();
    }

    private void requireEditable() {
        requireWorkOrderAllowsRouting();
        requireStatus(
                RoutingSheetStatus.DRAFT,
                "Solo una hoja de ruta DRAFT puede modificarse."
        );
    }

    private void requireWorkOrderAllowsRouting() {
        if (purpose == RoutingPurpose.PRODUCTION) {
            if (workOrder.getStatus() != WorkOrderStatus.CREATED) {
                throw new IllegalStateException(
                        "La hoja de ruta de producción solo puede prepararse mientras la orden esté en CREATED."
                );
            }
            if (nonConformity != null) {
                throw new IllegalStateException(
                        "Una ruta PRODUCTION no puede estar ligada a una no conformidad."
                );
            }
            return;
        }

        if (workOrder.getStatus() != WorkOrderStatus.QUALITY_HOLD) {
            throw new IllegalStateException(
                    "Una ruta REWORK solo puede prepararse mientras la orden esté en QUALITY_HOLD."
            );
        }
        if (nonConformity == null
                || nonConformity.getStatus() != NonConformityStatus.OPEN
                || nonConformity.getDisposition() != NonConformityDisposition.REWORK) {
            throw new IllegalStateException(
                    "Una ruta REWORK requiere una no conformidad OPEN con disposición REWORK."
            );
        }

        WorkOrder ncWorkOrder = nonConformity.getWorkOrder();
        if (ncWorkOrder != workOrder
                && (
                ncWorkOrder.getId() == null
                        || workOrder.getId() == null
                        || !ncWorkOrder.getId().equals(workOrder.getId())
        )) {
            throw new IllegalArgumentException(
                    "La no conformidad no pertenece a la orden de trabajo del routing."
            );
        }
    }

    private void requireSequenceAvailable(Integer sequenceNumber, Long ignoredOperationId) {
        requirePositive(sequenceNumber, "La secuencia de la operación debe ser mayor a cero.");
        boolean duplicated = operations.stream()
                .anyMatch(operation ->
                        (ignoredOperationId == null
                                || !Objects.equals(operation.getId(), ignoredOperationId))
                                && Objects.equals(operation.getSequenceNumber(), sequenceNumber)
                );
        if (duplicated) {
            throw new IllegalArgumentException(
                    "Ya existe una operación con esa secuencia en la hoja de ruta."
            );
        }
    }

    private void requireStatus(RoutingSheetStatus expected, String message) {
        if (status != expected) {
            throw new IllegalStateException(message);
        }
    }

    private static Integer requirePositive(Integer value, String message) {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }
}
