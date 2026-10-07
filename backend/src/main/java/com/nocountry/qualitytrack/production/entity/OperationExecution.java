package com.nocountry.qualitytrack.production.entity;

import com.nocountry.qualitytrack.machines.entity.Machine;
import com.nocountry.qualitytrack.production.enums.OperationExecutionStatus;
import com.nocountry.qualitytrack.routing.entity.RoutingOperation;
import com.nocountry.qualitytrack.routing.enums.RoutingSheetStatus;
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
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "operation_executions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OperationExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "routing_operation_id", nullable = false)
    private RoutingOperation routingOperation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "operator_id", nullable = false)
    private User operator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    private Machine machine;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OperationExecutionStatus status;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @Column(name = "quantity_processed", nullable = false)
    private Integer quantityProcessed;

    @Column(name = "quantity_accepted", nullable = false)
    private Integer quantityAccepted;

    @Column(name = "quantity_rejected", nullable = false)
    private Integer quantityRejected;

    @Column(name = "start_notes", columnDefinition = "TEXT")
    private String startNotes;

    @Column(name = "completion_notes", columnDefinition = "TEXT")
    private String completionNotes;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private OperationExecution(
            RoutingOperation routingOperation,
            User operator,
            Machine machine,
            Integer attemptNumber,
            String startNotes,
            Instant startedAt
    ) {
        this.routingOperation = Objects.requireNonNull(routingOperation);
        requireReleasedRouting(routingOperation);
        this.operator = Objects.requireNonNull(operator);
        this.machine = machine;
        this.attemptNumber = requirePositive(attemptNumber, "El número de intento debe ser mayor a cero.");
        this.startNotes = normalizeOptional(startNotes);
        this.startedAt = Objects.requireNonNull(startedAt);
        this.status = OperationExecutionStatus.IN_PROGRESS;
        this.quantityProcessed = 0;
        this.quantityAccepted = 0;
        this.quantityRejected = 0;
    }

    public static OperationExecution start(
            RoutingOperation routingOperation,
            User operator,
            Machine machine,
            Integer attemptNumber,
            String startNotes,
            Instant startedAt
    ) {
        return new OperationExecution(
                routingOperation,
                operator,
                machine,
                attemptNumber,
                startNotes,
                startedAt
        );
    }

    public void complete(
            Integer quantityProcessed,
            Integer quantityAccepted,
            Integer quantityRejected,
            String completionNotes,
            Instant finishedAt
    ) {
        requireInProgress();

        int processed = requirePositive(
                quantityProcessed,
                "La cantidad procesada debe ser mayor a cero."
        );
        int accepted = requireNonNegative(
                quantityAccepted,
                "La cantidad aceptada no puede ser negativa."
        );
        int rejected = requireNonNegative(
                quantityRejected,
                "La cantidad rechazada no puede ser negativa."
        );

        if (accepted + rejected != processed) {
            throw new IllegalArgumentException(
                    "La cantidad procesada debe ser igual a aceptada + rechazada."
            );
        }

        Instant nextFinishedAt = Objects.requireNonNull(finishedAt);
        if (nextFinishedAt.isBefore(startedAt)) {
            throw new IllegalArgumentException(
                    "La fecha de finalización no puede ser anterior al inicio."
            );
        }

        this.quantityProcessed = processed;
        this.quantityAccepted = accepted;
        this.quantityRejected = rejected;
        this.completionNotes = normalizeOptional(completionNotes);
        this.finishedAt = nextFinishedAt;
        this.status = OperationExecutionStatus.COMPLETED;
    }

    public void cancel(String reason, Instant finishedAt) {
        requireInProgress();
        String normalizedReason = requireText(
                reason,
                "El motivo de cancelación de la ejecución es obligatorio."
        );
        Instant nextFinishedAt = Objects.requireNonNull(finishedAt);
        if (nextFinishedAt.isBefore(startedAt)) {
            throw new IllegalArgumentException(
                    "La fecha de cancelación no puede ser anterior al inicio."
            );
        }

        this.cancellationReason = normalizedReason;
        this.finishedAt = nextFinishedAt;
        this.status = OperationExecutionStatus.CANCELLED;
    }

    private void requireInProgress() {
        if (status != OperationExecutionStatus.IN_PROGRESS) {
            throw new IllegalStateException(
                    "Solo una ejecución IN_PROGRESS puede finalizarse o cancelarse."
            );
        }
    }

    private static void requireReleasedRouting(RoutingOperation operation) {
        if (operation.getRoutingSheet().getStatus() != RoutingSheetStatus.RELEASED) {
            throw new IllegalStateException(
                    "Solo pueden ejecutarse operaciones de una hoja de ruta RELEASED."
            );
        }
    }

    private static int requirePositive(Integer value, String message) {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }

    private static int requireNonNegative(Integer value, String message) {
        if (value == null || value < 0) {
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
