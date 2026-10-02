package com.nocountry.qualitytrack.users.dto.request;

import com.nocountry.qualitytrack.users.enums.InternalUserAccessStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateInternalUserStatusRequest(
        @NotNull(message = "El estado es obligatorio.")
        InternalUserAccessStatus status
) {
}
