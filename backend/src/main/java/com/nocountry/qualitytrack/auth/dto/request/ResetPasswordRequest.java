package com.nocountry.qualitytrack.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "El token para restablecer la contraseña es obligatorio.")
        String token,

        @NotBlank(message = "La nueva contraseña es obligatoria.")
        @Size(min = 8, max = 72, message = "La contraseña debe contener entre 8 y 72 caracteres.")
        String newPassword
) {
}
