package com.nocountry.qualitytrack.users.dto.request;

import com.nocountry.qualitytrack.users.enums.SystemRole;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record UpdateInternalUserRolesRequest(
        @NotEmpty(message = "Debes asignar al menos un rol.")
        @Size(max = 7, message = "No puedes asignar más roles de los disponibles en el sistema.")
        Set<@NotNull(message = "Los roles no pueden contener valores nulos.") SystemRole> roles
) {
}
