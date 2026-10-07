package com.nocountry.qualitytrack.quotations.dto.request;

import jakarta.validation.constraints.Size;

public record SendQuotationRequest(
        @Size(max = 2000, message = "La respuesta al ajuste no puede exceder 2000 caracteres.")
        String adjustmentResponse
) {
}
