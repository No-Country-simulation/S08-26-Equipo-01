package com.nocountry.qualitytrack.quotations.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RequestQuotationAdjustmentRequest(
        @NotBlank(message = "Indica qué ajuste necesita la cotización.")
        @Size(max = 2000, message = "La solicitud de ajuste no puede exceder 2000 caracteres.")
        String notes
) {
}
