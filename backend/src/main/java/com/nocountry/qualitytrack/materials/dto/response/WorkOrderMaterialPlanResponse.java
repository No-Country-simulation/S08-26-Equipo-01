package com.nocountry.qualitytrack.materials.dto.response;

import com.nocountry.qualitytrack.materials.entity.WorkOrderMaterialPlan;
import com.nocountry.qualitytrack.users.entity.User;

import java.math.BigDecimal;
import java.time.Instant;

public record WorkOrderMaterialPlanResponse(
        Long id,
        Long workOrderId,
        Long materialId,
        String materialCode,
        String materialName,
        BigDecimal plannedQuantity,
        String unit,
        Long plannedByUserId,
        String plannedByName,
        Instant plannedAt,
        Instant updatedAt
) {
    public static WorkOrderMaterialPlanResponse from(WorkOrderMaterialPlan plan) {
        var material = plan.getMaterial();

        return new WorkOrderMaterialPlanResponse(
                plan.getId(),
                plan.getWorkOrder().getId(),
                material.getId(),
                material.getCode(),
                material.getName(),
                plan.getPlannedQuantity(),
                material.getUnit(),
                plan.getPlannedByUser().getId(),
                fullName(plan.getPlannedByUser()),
                plan.getPlannedAt(),
                plan.getUpdatedAt()
        );
    }

    private static String fullName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
