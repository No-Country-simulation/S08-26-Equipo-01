package com.nocountry.qualitytrack.requests.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RespondCaseInformationRequest(
        @NotBlank(message = "La respuesta es obligatoria.")
        @Size(max = 4000, message = "La respuesta no puede exceder 4000 caracteres.")
        String response
) {
}
