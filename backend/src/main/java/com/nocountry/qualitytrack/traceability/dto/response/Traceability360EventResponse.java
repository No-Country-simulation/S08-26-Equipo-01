package com.nocountry.qualitytrack.traceability.dto.response;

import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;

import java.time.Instant;
import java.util.List;

public record Traceability360EventResponse(
        Long id,
        TraceabilityAggregateType aggregateType,
        Long aggregateId,
        TraceabilityEventType eventType,
        Long performedByUserId,
        String performedByName,
        Instant occurredAt,
        TraceabilitySnapshotResponse snapshot,
        List<TraceabilityActionResponse> actions
) {
    public Traceability360EventResponse {
        actions = actions == null ? List.of() : List.copyOf(actions);
    }

    public static Traceability360EventResponse from(
            TraceabilityEventResponse event,
            List<TraceabilityActionResponse> actions
    ) {
        return new Traceability360EventResponse(
                event.id(),
                event.aggregateType(),
                event.aggregateId(),
                event.eventType(),
                event.performedByUserId(),
                event.performedByName(),
                event.occurredAt(),
                TraceabilitySnapshotResponse.from(event),
                actions
        );
    }
}
