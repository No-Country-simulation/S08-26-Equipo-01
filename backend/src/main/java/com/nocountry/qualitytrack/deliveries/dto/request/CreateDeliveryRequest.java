package com.nocountry.qualitytrack.deliveries.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record CreateDeliveryRequest(
        @NotNull @Positive Integer quantity,
        @NotBlank @Size(max = 160) String destinationRecipientName,
        @NotBlank @Size(max = 300) String destinationAddress,
        @NotBlank @Size(max = 120) String destinationCity,
        @NotBlank @Size(max = 120) String destinationState,
        @NotBlank @Size(max = 20) String destinationPostalCode,
        @NotBlank @Size(max = 100) String destinationCountry,
        @NotBlank @Size(max = 80) String deliveryMethod
) {
}
