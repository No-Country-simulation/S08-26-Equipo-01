package com.nocountry.qualitytrack.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(
        @NotBlank(message = "El token de verificación es obligatorio.")
        String token
) {
}
