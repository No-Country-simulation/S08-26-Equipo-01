package com.nocountry.qualitytrack.materials.dto.response;

import com.nocountry.qualitytrack.materials.entity.Material;

import java.time.Instant;

public record MaterialResponse(
        Long id,
        String code,
        String name,
        String specification,
        String unit,
        Instant createdAt,
        Instant updatedAt
) {
    public static MaterialResponse from(Material material) {
        return new MaterialResponse(
                material.getId(),
                material.getCode(),
                material.getName(),
                material.getSpecification(),
                material.getUnit(),
                material.getCreatedAt(),
                material.getUpdatedAt()
        );
    }
}
