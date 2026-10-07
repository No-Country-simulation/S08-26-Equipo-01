package com.nocountry.qualitytrack.quotations.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record UpdateQuotationRequest(
        @NotBlank(message = "La moneda es obligatoria.")
        @Pattern(regexp = "^[A-Z]{3}$", message = "La moneda debe usar un código ISO de 3 letras mayúsculas.")
        String currency,

        @NotNull(message = "La tasa de impuesto es obligatoria.")
        @DecimalMin(value = "0.0000", message = "La tasa de impuesto no puede ser negativa.")
        @DecimalMax(value = "100.0000", message = "La tasa de impuesto no puede ser mayor a 100.")
        @Digits(integer = 3, fraction = 4, message = "La tasa de impuesto admite hasta 4 decimales.")
        BigDecimal taxRate,

        LocalDate validUntil,
        LocalDate estimatedDeliveryDate,

        @NotNull(message = "La lista de conceptos es obligatoria.")
        @Size(max = 100, message = "Una cotización no puede contener más de 100 conceptos.")
        List<@Valid QuotationItemRequest> items
) {
}
