package com.nocountry.qualitytrack.auth.dto.request;

import com.nocountry.qualitytrack.shared.validation.Utf8ByteLength;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "El token para restablecer la contraseña es obligatorio.")
        String token,

        @NotBlank(message = "La nueva contraseña es obligatoria.")
        @Size(min = 8, message = "La contraseña debe contener al menos 8 caracteres.")
        @Utf8ByteLength(max = 72, message = "La contraseña no puede superar los 72 bytes en UTF-8.")
        String newPassword
) {
}
