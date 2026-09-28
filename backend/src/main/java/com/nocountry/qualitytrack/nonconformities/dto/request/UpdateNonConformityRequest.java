package com.nocountry.qualitytrack.nonconformities.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateNonConformityRequest(
        @NotNull @Positive Integer affectedQuantity,
        @NotBlank @Size(max = 50) String severity,
        @NotBlank @Size(max = 4000) String description
) {
}
