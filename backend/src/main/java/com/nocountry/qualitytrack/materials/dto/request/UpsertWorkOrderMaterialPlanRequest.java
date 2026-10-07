package com.nocountry.qualitytrack.materials.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpsertWorkOrderMaterialPlanRequest(
        @NotNull(message = "Selecciona un material.")
        Long materialId,

        @NotNull(message = "Indica la cantidad prevista.")
        @DecimalMin(value = "0.001", message = "La cantidad prevista debe ser mayor a cero.")
        BigDecimal plannedQuantity
) {
}
