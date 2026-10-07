package com.nocountry.qualitytrack.routing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReopenRoutingSheetRequest(
        @NotBlank(message = "El motivo de reapertura es obligatorio.")
        @Size(max = 1000, message = "El motivo no puede exceder 1000 caracteres.")
        String reason
) {
}
