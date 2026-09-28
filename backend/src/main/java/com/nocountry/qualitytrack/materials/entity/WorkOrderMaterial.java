package com.nocountry.qualitytrack.materials.entity;

import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "work_order_materials")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrderMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_lot_id", nullable = false)
    private MaterialLot materialLot;

    @Column(name = "quantity_used", nullable = false, precision = 14, scale = 3)
    private BigDecimal quantityUsed;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recorded_by_user_id", nullable = false)
    private User recordedByUser;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    private WorkOrderMaterial(
            WorkOrder workOrder,
            MaterialLot materialLot,
            BigDecimal quantityUsed,
            User recordedByUser,
            Instant recordedAt
    ) {
        this.workOrder = Objects.requireNonNull(workOrder);
        this.materialLot = Objects.requireNonNull(materialLot);
        this.quantityUsed = requirePositive(quantityUsed);
        this.recordedByUser = Objects.requireNonNull(recordedByUser);
        this.recordedAt = Objects.requireNonNull(recordedAt);
    }

    public static WorkOrderMaterial create(
            WorkOrder workOrder,
            MaterialLot materialLot,
            BigDecimal quantityUsed,
            User recordedByUser,
            Instant recordedAt
    ) {
        return new WorkOrderMaterial(
                workOrder,
                materialLot,
                quantityUsed,
                recordedByUser,
                recordedAt
        );
    }

    public void addQuantity(BigDecimal additionalQuantity, User actor, Instant recordedAt) {
        this.quantityUsed = this.quantityUsed.add(requirePositive(additionalQuantity));
        this.recordedByUser = Objects.requireNonNull(actor);
        this.recordedAt = Objects.requireNonNull(recordedAt);
    }

    private static BigDecimal requirePositive(BigDecimal value) {
        if (value == null || value.signum() <= 0) {
            throw new IllegalArgumentException("La cantidad utilizada debe ser mayor a cero.");
        }
        return value;
    }
}
