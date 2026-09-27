package com.nocountry.qualitytrack.routing.entity;

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
            User createdByUser
    ) {
        this.workOrder = Objects.requireNonNull(workOrder);
        requireWorkOrderCreated();
        this.revision = requirePositive(revision, "La revisión de routing debe ser mayor a cero.");
        this.purpose = Objects.requireNonNull(purpose);
        this.createdByUser = Objects.requireNonNull(createdByUser);
        this.status = RoutingSheetStatus.DRAFT;
    }

    public static RoutingSheet createProduction(
            WorkOrder workOrder,
            User createdByUser
    ) {
        return new RoutingSheet(
                workOrder,
                1,
                RoutingPurpose.PRODUCTION,
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
        requireWorkOrderCreated();
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
        requireWorkOrderCreated();
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
        requireWorkOrderCreated();
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
        requireWorkOrderCreated();
        requireStatus(
                RoutingSheetStatus.DRAFT,
                "Solo una hoja de ruta DRAFT puede modificarse."
        );
    }

    private void requireWorkOrderCreated() {
        if (workOrder.getStatus() != WorkOrderStatus.CREATED) {
            throw new IllegalStateException(
                    "La hoja de ruta solo puede prepararse mientras la orden esté en CREATED."
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
