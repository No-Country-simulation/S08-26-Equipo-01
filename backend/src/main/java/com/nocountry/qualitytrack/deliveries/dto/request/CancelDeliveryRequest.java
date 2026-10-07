package com.nocountry.qualitytrack.deliveries.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelDeliveryRequest(
        @NotBlank @Size(max = 1000) String reason
) {
}
