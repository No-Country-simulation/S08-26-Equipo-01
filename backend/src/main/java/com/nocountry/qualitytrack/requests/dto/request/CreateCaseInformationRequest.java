package com.nocountry.qualitytrack.requests.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCaseInformationRequest(
        @NotBlank(message = "La pregunta es obligatoria.")
        @Size(max = 2000, message = "La pregunta no puede exceder 2000 caracteres.")
        String question
) {
}
