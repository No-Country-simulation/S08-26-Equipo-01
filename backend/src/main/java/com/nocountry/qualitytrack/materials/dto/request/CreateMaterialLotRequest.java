package com.nocountry.qualitytrack.materials.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateMaterialLotRequest(
        @NotBlank @Size(max = 100) String lotNumber,
        @Size(max = 255) String supplier,
        Instant receivedAt,
        @NotNull @DecimalMin(value = "0.001") BigDecimal quantityReceived,
        @Positive Long certificateDocumentVersionId
) {
}
