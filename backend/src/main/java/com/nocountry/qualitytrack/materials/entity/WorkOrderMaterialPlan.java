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
@Table(name = "work_order_material_plans")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WorkOrderMaterialPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "material_id", nullable = false)
    private Material material;

    @Column(name = "planned_quantity", nullable = false, precision = 14, scale = 3)
    private BigDecimal plannedQuantity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "planned_by_user_id", nullable = false)
    private User plannedByUser;

    @Column(name = "planned_at", nullable = false, updatable = false)
    private Instant plannedAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private WorkOrderMaterialPlan(
            WorkOrder workOrder,
            Material material,
            BigDecimal plannedQuantity,
            User plannedByUser,
            Instant now
    ) {
        this.workOrder = Objects.requireNonNull(workOrder);
        this.material = Objects.requireNonNull(material);
        this.plannedQuantity = requirePositive(plannedQuantity);
        this.plannedByUser = Objects.requireNonNull(plannedByUser);
        this.plannedAt = Objects.requireNonNull(now);
        this.updatedAt = now;
    }

    public static WorkOrderMaterialPlan create(
            WorkOrder workOrder,
            Material material,
            BigDecimal plannedQuantity,
            User plannedByUser,
            Instant now
    ) {
        return new WorkOrderMaterialPlan(
                workOrder,
                material,
                plannedQuantity,
                plannedByUser,
                now
        );
    }

    public void update(BigDecimal plannedQuantity, User actor, Instant now) {
        this.plannedQuantity = requirePositive(plannedQuantity);
        this.plannedByUser = Objects.requireNonNull(actor);
        this.updatedAt = Objects.requireNonNull(now);
    }

    private static BigDecimal requirePositive(BigDecimal value) {
        if (value == null || value.signum() <= 0) {
            throw new IllegalArgumentException("La cantidad prevista debe ser mayor a cero.");
        }
        return value;
    }
}
