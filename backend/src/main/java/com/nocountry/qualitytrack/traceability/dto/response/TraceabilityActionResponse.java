package com.nocountry.qualitytrack.traceability.dto.response;

import com.nocountry.qualitytrack.traceability.enums.TraceabilityActionType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityResourceType;

public record TraceabilityActionResponse(
        TraceabilityActionType type,
        String label,
        TraceabilityResourceType resourceType,
        Long resourceId
) {
}
