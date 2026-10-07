package com.nocountry.qualitytrack.routing.dto.response;

import com.nocountry.qualitytrack.routing.entity.RoutingOperation;

import java.time.Instant;
import java.util.List;

public record RoutingOperationResponse(
        Long id,
        Integer sequenceNumber,
        String code,
        String name,
        String instructions,
        Integer estimatedMinutes,
        List<Long> prerequisiteOperationIds,
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
                operation.getPrerequisites().stream()
                        .sorted((left, right) -> Integer.compare(
                                left.getSequenceNumber(),
                                right.getSequenceNumber()
                        ))
                        .map(RoutingOperation::getId)
                        .toList(),
                operation.getCreatedAt(),
                operation.getUpdatedAt()
        );
    }
}
