package com.nocountry.qualitytrack.traceability.dto.response;

import com.nocountry.qualitytrack.traceability.entity.TraceabilityEvent;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.users.entity.User;

import java.time.Instant;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public record TraceabilityEventResponse(
        Long id,
        TraceabilityAggregateType aggregateType,
        Long aggregateId,
        TraceabilityEventType eventType,
        String fromStatus,
        String toStatus,
        Long performedByUserId,
        String performedByName,
        Map<String, Object> metadata,
        Instant occurredAt
) {
    public static TraceabilityEventResponse from(TraceabilityEvent event) {
        User actor = event.getPerformedByUser();

        return new TraceabilityEventResponse(
                event.getId(),
                event.getAggregateType(),
                event.getAggregateId(),
                event.getEventType(),
                event.getFromStatus(),
                event.getToStatus(),
                actor == null ? null : actor.getId(),
                actor == null ? null : fullName(actor.getFirstName(), actor.getLastName()),
                immutableMetadata(event.getMetadata()),
                event.getOccurredAt()
        );
    }

    private static Map<String, Object> immutableMetadata(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return Map.of();
        }
        return Collections.unmodifiableMap(new LinkedHashMap<>(metadata));
    }

    private static String fullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String fullName = (first + " " + last).trim();
        return fullName.isBlank() ? null : fullName;
    }
}
