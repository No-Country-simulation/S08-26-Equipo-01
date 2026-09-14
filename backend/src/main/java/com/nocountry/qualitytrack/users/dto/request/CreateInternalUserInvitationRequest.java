package com.nocountry.qualitytrack.users.dto.request;

import com.nocountry.qualitytrack.users.enums.SystemRole;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CreateInternalUserInvitationRequest(
        @NotBlank(message = "El nombre es obligatorio.")
        @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres.")
        String firstName,

        @NotBlank(message = "El apellido es obligatorio.")
        @Size(max = 100, message = "El apellido no puede exceder los 100 caracteres.")
        String lastName,

        @NotBlank(message = "El correo electrónico es obligatorio.")
        @Email(message = "El correo electrónico no tiene un formato válido.")
        @Size(max = 254, message = "El correo electrónico no puede exceder los 254 caracteres.")
        String email,

        @NotEmpty(message = "Debes asignar al menos un rol.")
        @Size(max = 7, message = "No puedes asignar más roles de los disponibles en el sistema.")
        Set<@NotNull(message = "Los roles no pueden contener valores nulos.") SystemRole> roles
) {
}
