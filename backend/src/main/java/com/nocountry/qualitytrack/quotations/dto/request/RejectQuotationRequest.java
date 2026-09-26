package com.nocountry.qualitytrack.quotations.dto.request;

import jakarta.validation.constraints.Size;

public record RejectQuotationRequest(
        @Size(max = 2000, message = "El motivo de rechazo no puede exceder 2000 caracteres.")
        String reason
) {
}
