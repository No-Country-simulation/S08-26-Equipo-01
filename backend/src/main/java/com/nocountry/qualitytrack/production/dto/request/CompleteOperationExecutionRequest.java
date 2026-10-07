package com.nocountry.qualitytrack.production.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CompleteOperationExecutionRequest(
        @NotNull @Positive Integer quantityProcessed,
        @NotNull @PositiveOrZero Integer quantityAccepted,
        @NotNull @PositiveOrZero Integer quantityRejected,
        @Size(max = 2000) String completionNotes
) {
}
