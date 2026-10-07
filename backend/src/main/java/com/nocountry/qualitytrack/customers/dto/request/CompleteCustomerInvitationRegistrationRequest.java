package com.nocountry.qualitytrack.customers.dto.request;

import com.nocountry.qualitytrack.shared.validation.Utf8ByteLength;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompleteCustomerInvitationRegistrationRequest(
        @NotBlank(message = "El token de invitación es obligatorio.")
        @Size(max = 512, message = "El token de invitación no es válido.")
        String token,

        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres.")
        String firstName,

        @NotBlank(message = "El apellido es obligatorio.")
        @Size(max = 100, message = "El apellido no puede exceder los 100 caracteres.")
        String lastName,

        @NotBlank(message = "La contraseña es obligatoria.")
        @Size(min = 8, message = "La contraseña debe contener al menos 8 caracteres.")
        @Utf8ByteLength(max = 72, message = "La contraseña no puede superar los 72 bytes en UTF-8.")
        String password
) {
}
