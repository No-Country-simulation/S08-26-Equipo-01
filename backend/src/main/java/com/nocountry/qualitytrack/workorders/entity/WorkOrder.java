package com.nocountry.qualitytrack.workorders.entity;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@Table(name = "work_orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false, unique = true)
    private JobCase jobCase;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "approved_quotation_id", nullable = false, unique = true)
    private Quotation approvedQuotation;

    @Column(name = "work_order_number", nullable = false, length = 30, unique = true)
    private String workOrderNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WorkOrderPriority priority;

    @Column(name = "planned_quantity", nullable = false)
    private Integer plannedQuantity;

    @Column(name = "planned_start_date")
    private LocalDate plannedStartDate;

    @Column(name = "planned_end_date")
    private LocalDate plannedEndDate;

    @Column(name = "agreed_delivery_date", nullable = false)
    private LocalDate agreedDeliveryDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by_user_id")
    private User cancelledByUser;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private WorkOrder(
            JobCase jobCase,
            Quotation approvedQuotation,
            String workOrderNumber,
            WorkOrderPriority priority,
            Integer plannedQuantity,
            LocalDate plannedStartDate,
            LocalDate plannedEndDate,
            LocalDate agreedDeliveryDate,
            User createdByUser
    ) {
        this.jobCase = Objects.requireNonNull(jobCase);
        this.approvedQuotation = Objects.requireNonNull(approvedQuotation);
        this.workOrderNumber = requireText(workOrderNumber, "El número de orden de trabajo es obligatorio.");
        this.priority = Objects.requireNonNull(priority);
        this.plannedQuantity = requirePositive(plannedQuantity, "La cantidad planeada debe ser mayor a cero.");
        this.plannedStartDate = Objects.requireNonNull(plannedStartDate);
        this.plannedEndDate = Objects.requireNonNull(plannedEndDate);
        this.agreedDeliveryDate = Objects.requireNonNull(agreedDeliveryDate);
        this.createdByUser = Objects.requireNonNull(createdByUser);
        validatePlanningDates(plannedStartDate, plannedEndDate, agreedDeliveryDate);
        this.status = WorkOrderStatus.CREATED;
    }

    public static WorkOrder create(
            JobCase jobCase,
            Quotation approvedQuotation,
            String workOrderNumber,
            WorkOrderPriority priority,
            Integer plannedQuantity,
            LocalDate plannedStartDate,
            LocalDate plannedEndDate,
            LocalDate agreedDeliveryDate,
            User createdByUser
    ) {
        return new WorkOrder(
                jobCase,
                approvedQuotation,
                workOrderNumber,
                priority,
                plannedQuantity,
                plannedStartDate,
                plannedEndDate,
                agreedDeliveryDate,
                createdByUser
        );
    }

    public void updatePlanning(
            WorkOrderPriority priority,
            LocalDate plannedStartDate,
            LocalDate plannedEndDate
    ) {
        if (status != WorkOrderStatus.CREATED) {
            throw new IllegalStateException(
                    "Solo una orden de trabajo en CREATED puede replanificarse."
            );
        }

        WorkOrderPriority nextPriority = Objects.requireNonNull(priority);
        LocalDate nextStartDate = Objects.requireNonNull(plannedStartDate);
        LocalDate nextEndDate = Objects.requireNonNull(plannedEndDate);

        validatePlanningDates(nextStartDate, nextEndDate, agreedDeliveryDate);

        this.priority = nextPriority;
        this.plannedStartDate = nextStartDate;
        this.plannedEndDate = nextEndDate;
    }

    public void releaseToProduction() {
        if (status != WorkOrderStatus.CREATED) {
            throw new IllegalStateException(
                    "Solo una orden de trabajo en CREATED puede liberarse a producción."
            );
        }
        if (plannedQuantity == null || plannedQuantity <= 0
                || plannedStartDate == null
                || plannedEndDate == null) {
            throw new IllegalStateException(
                    "La orden de trabajo necesita planificación completa antes de liberarse."
            );
        }
        this.status = WorkOrderStatus.READY_FOR_PRODUCTION;
    }

    public void cancel(User actor, String reason, Instant cancelledAt) {
        if (status != WorkOrderStatus.CREATED) {
            throw new IllegalStateException(
                    "Solo una orden de trabajo en CREATED puede cancelarse en esta etapa."
            );
        }

        this.cancelledByUser = Objects.requireNonNull(actor);
        this.cancellationReason = normalizeOptional(reason);
        this.cancelledAt = Objects.requireNonNull(cancelledAt);
        this.status = WorkOrderStatus.CANCELLED;
    }

    private static void validatePlanningDates(
            LocalDate plannedStartDate,
            LocalDate plannedEndDate,
            LocalDate agreedDeliveryDate
    ) {
        if (plannedStartDate.isAfter(plannedEndDate)) {
            throw new IllegalArgumentException(
                    "La fecha de inicio planeada no puede ser posterior a la fecha de fin."
            );
        }
        if (!plannedEndDate.isBefore(agreedDeliveryDate)) {
            throw new IllegalArgumentException(
                    "La fabricación debe terminar antes de la fecha comprometida de entrega."
            );
        }
    }

    private static Integer requirePositive(Integer value, String message) {
        if (value == null || value <= 0) {
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
