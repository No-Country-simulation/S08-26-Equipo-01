package com.nocountry.qualitytrack.traceability.dto.response;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;

public record TraceabilitySnapshotResponse(
        String fromStatus,
        String toStatus,
        Map<String, Object> details
) {
    public TraceabilitySnapshotResponse {
        details = details == null || details.isEmpty()
                ? Map.of()
                : Collections.unmodifiableMap(new LinkedHashMap<>(details));
    }

    public static TraceabilitySnapshotResponse from(TraceabilityEventResponse event) {
        return new TraceabilitySnapshotResponse(
                event.fromStatus(),
                event.toStatus(),
                event.metadata()
        );
    }
}
