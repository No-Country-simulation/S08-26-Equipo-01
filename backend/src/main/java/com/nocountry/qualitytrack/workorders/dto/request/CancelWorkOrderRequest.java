package com.nocountry.qualitytrack.workorders.dto.request;

import jakarta.validation.constraints.Size;

public record CancelWorkOrderRequest(
        @Size(max = 2000, message = "El motivo de cancelación no puede exceder 2000 caracteres.")
        String reason
) {
}
