package com.nocountry.qualitytrack.workorders.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PinWorkOrderDocumentRequest(
        @NotNull(message = "La versión del documento es obligatoria.")
        @Positive(message = "La versión del documento debe ser válida.")
        Long versionId
) {
}
