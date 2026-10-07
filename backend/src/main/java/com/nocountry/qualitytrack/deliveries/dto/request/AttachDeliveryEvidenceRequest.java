package com.nocountry.qualitytrack.deliveries.dto.request;

import jakarta.validation.constraints.NotNull;

public record AttachDeliveryEvidenceRequest(
        @NotNull Long documentVersionId
) {
}
