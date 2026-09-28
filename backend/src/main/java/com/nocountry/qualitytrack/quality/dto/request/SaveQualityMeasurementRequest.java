package com.nocountry.qualitytrack.quality.dto.request;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record SaveQualityMeasurementRequest(
        @NotBlank @Size(max = 200) String characteristic,
        @NotNull @Digits(integer = 12, fraction = 6) BigDecimal nominalValue,
        @NotNull @Digits(integer = 12, fraction = 6) BigDecimal lowerLimit,
        @NotNull @Digits(integer = 12, fraction = 6) BigDecimal upperLimit,
        @NotNull @Digits(integer = 12, fraction = 6) BigDecimal measuredValue,
        @NotBlank @Size(max = 20) String unit,
        @Size(max = 2000) String notes
) {
}
