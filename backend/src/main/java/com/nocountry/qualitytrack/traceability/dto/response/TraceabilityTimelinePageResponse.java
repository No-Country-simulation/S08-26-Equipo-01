package com.nocountry.qualitytrack.traceability.dto.response;

import java.util.List;

public record TraceabilityTimelinePageResponse(
        List<TraceabilityEventResponse> items,
        String nextCursor,
        boolean hasMore
) {
    public TraceabilityTimelinePageResponse {
        items = items == null ? List.of() : List.copyOf(items);
    }
}
