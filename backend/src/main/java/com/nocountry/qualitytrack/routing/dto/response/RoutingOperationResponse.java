package com.nocountry.qualitytrack.routing.dto.response;

import com.nocountry.qualitytrack.routing.entity.RoutingOperation;

import java.time.Instant;

public record RoutingOperationResponse(
        Long id,
        Integer sequenceNumber,
        String code,
        String name,
        String instructions,
        Integer estimatedMinutes,
        Instant createdAt,
        Instant updatedAt
) {
    public static RoutingOperationResponse from(RoutingOperation operation) {
        return new RoutingOperationResponse(
                operation.getId(),
                operation.getSequenceNumber(),
                operation.getCode(),
                operation.getName(),
                operation.getInstructions(),
                operation.getEstimatedMinutes(),
                operation.getCreatedAt(),
                operation.getUpdatedAt()
        );
    }
}
