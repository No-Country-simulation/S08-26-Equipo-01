package com.nocountry.qualitytrack.deliveries.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CompleteDeliveryRequest(
        @NotBlank @Size(max = 160) String receivedByName,
        @NotNull @PastOrPresent Instant deliveredAt,
        Long evidenceDocumentVersionId
) {
}
