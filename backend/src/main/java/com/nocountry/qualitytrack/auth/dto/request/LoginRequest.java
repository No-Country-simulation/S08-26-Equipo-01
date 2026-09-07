package com.nocountry.qualitytrack.auth.dto.request;

import com.nocountry.qualitytrack.shared.validation.Utf8ByteLength;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "El correo electrónico es obligatorio.")
        @Email(message = "El correo electrónico no tiene un formato válido.")
        @Size(max = 254, message = "El correo electrónico no puede exceder los 254 caracteres.")
        String email,

        @NotBlank(message = "La contraseña es obligatoria.")
        @Utf8ByteLength(max = 72, message = "La contraseña no puede superar los 72 bytes en UTF-8.")
        String password
) {
}
