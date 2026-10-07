package com.nocountry.qualitytrack.users.dto.request;

import com.nocountry.qualitytrack.shared.validation.Utf8ByteLength;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangeOwnPasswordRequest(
        @NotBlank(message = "La contraseña actual es obligatoria.")
        String currentPassword,

        @NotBlank(message = "La nueva contraseña es obligatoria.")
        @Size(min = 8, message = "La nueva contraseña debe contener al menos 8 caracteres.")
        @Utf8ByteLength(max = 72, message = "La nueva contraseña no puede superar los 72 bytes en UTF-8.")
        String newPassword
) {
}
