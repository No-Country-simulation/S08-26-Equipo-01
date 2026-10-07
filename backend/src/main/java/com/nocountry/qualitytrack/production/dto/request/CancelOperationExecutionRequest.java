package com.nocountry.qualitytrack.production.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelOperationExecutionRequest(
        @NotBlank @Size(max = 1000) String cancellationReason
) {
}
