package com.nocountry.qualitytrack.materials.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record RecordMaterialConsumptionRequest(
        @NotNull @Positive Long materialLotId,
        @NotNull @DecimalMin(value = "0.001") BigDecimal quantityUsed
) {
}
