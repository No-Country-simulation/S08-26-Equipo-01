package com.nocountry.qualitytrack.quality.dto.request;

import com.nocountry.qualitytrack.quality.enums.QualityCheckResult;
import com.nocountry.qualitytrack.quality.enums.QualityCheckType;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record SaveQualityCheckRequest(
        @NotNull QualityCheckType type,
        @NotBlank @Size(max = 200) String name,
        @Digits(integer = 12, fraction = 6) BigDecimal nominalValue,
        @Digits(integer = 12, fraction = 6) BigDecimal lowerLimit,
        @Digits(integer = 12, fraction = 6) BigDecimal upperLimit,
        @Digits(integer = 12, fraction = 6) BigDecimal measuredValue,
        @Size(max = 20) String unit,
        QualityCheckResult result,
        @Size(max = 2000) String notes
) {
}
