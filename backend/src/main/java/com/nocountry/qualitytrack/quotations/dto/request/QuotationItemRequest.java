package com.nocountry.qualitytrack.quotations.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record QuotationItemRequest(
        @Positive(message = "El id del concepto debe ser mayor que cero.")
        Long id,

        @NotBlank(message = "La descripción del concepto es obligatoria.")
        @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres.")
        String description,

        @NotNull(message = "La cantidad es obligatoria.")
        @DecimalMin(value = "0.00", inclusive = false, message = "La cantidad debe ser mayor que cero.")
        @Digits(integer = 10, fraction = 2, message = "La cantidad admite hasta 10 enteros y 2 decimales.")
        BigDecimal quantity,

        @NotNull(message = "El precio unitario es obligatorio.")
        @DecimalMin(value = "0.00", message = "El precio unitario no puede ser negativo.")
        @Digits(integer = 12, fraction = 2, message = "El precio unitario admite hasta 12 enteros y 2 decimales.")
        BigDecimal unitPrice
) {
}
