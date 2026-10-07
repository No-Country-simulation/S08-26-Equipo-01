package com.nocountry.qualitytrack.production.dto.request;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record StartOperationExecutionRequest(
        @Positive Long operatorId,
        @Positive Long machineId,
        @Size(max = 2000) String startNotes
) {
}
