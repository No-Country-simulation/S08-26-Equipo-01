package com.nocountry.qualitytrack.deliveries.dto.request;

import jakarta.validation.constraints.Size;

public record DispatchDeliveryRequest(
        @Size(max = 120) String carrier,
        @Size(max = 160) String trackingNumber
) {
}
