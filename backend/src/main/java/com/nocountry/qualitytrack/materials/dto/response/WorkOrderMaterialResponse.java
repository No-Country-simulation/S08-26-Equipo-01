package com.nocountry.qualitytrack.materials.dto.response;

import com.nocountry.qualitytrack.materials.entity.WorkOrderMaterial;
import com.nocountry.qualitytrack.users.entity.User;

import java.math.BigDecimal;
import java.time.Instant;

public record WorkOrderMaterialResponse(
        Long id,
        Long workOrderId,
        Long materialLotId,
        Long materialId,
        String materialCode,
        String materialName,
        String lotNumber,
        BigDecimal quantityUsed,
        String unit,
        Long recordedByUserId,
        String recordedByName,
        Instant recordedAt
) {
    public static WorkOrderMaterialResponse from(WorkOrderMaterial consumption) {
        var lot = consumption.getMaterialLot();
        var material = lot.getMaterial();

        return new WorkOrderMaterialResponse(
                consumption.getId(),
                consumption.getWorkOrder().getId(),
                lot.getId(),
                material.getId(),
                material.getCode(),
                material.getName(),
                lot.getLotNumber(),
                consumption.getQuantityUsed(),
                material.getUnit(),
                consumption.getRecordedByUser().getId(),
                fullName(consumption.getRecordedByUser()),
                consumption.getRecordedAt()
        );
    }

    private static String fullName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
