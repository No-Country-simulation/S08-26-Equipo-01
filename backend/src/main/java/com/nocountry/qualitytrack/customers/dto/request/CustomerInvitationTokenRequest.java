package com.nocountry.qualitytrack.customers.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerInvitationTokenRequest(
        @NotBlank(message = "El token de invitación es obligatorio.")
        @Size(max = 512, message = "El token de invitación no es válido.")
        String token
) {
}
