package com.nocountry.qualitytrack.routing.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateRoutingOperationRequest(
        @NotNull(message = "La secuencia es obligatoria.")
        @Positive(message = "La secuencia debe ser mayor a cero.")
        Integer sequenceNumber,

        @NotBlank(message = "El código es obligatorio.")
        @Size(max = 40, message = "El código no puede exceder 40 caracteres.")
        String code,

        @NotBlank(message = "El nombre de la operación es obligatorio.")
        @Size(max = 150, message = "El nombre no puede exceder 150 caracteres.")
        String name,

        String instructions,

        @NotNull(message = "El tiempo estimado es obligatorio.")
        @Positive(message = "El tiempo estimado debe ser mayor a cero.")
        Integer estimatedMinutes,

        List<Long> prerequisiteOperationIds,

        Boolean resequenceOperations
) {
    public UpdateRoutingOperationRequest(
            Integer sequenceNumber,
            String code,
            String name,
            String instructions,
            Integer estimatedMinutes,
            List<Long> prerequisiteOperationIds
    ) {
        this(
                sequenceNumber,
                code,
                name,
                instructions,
                estimatedMinutes,
                prerequisiteOperationIds,
                false
        );
    }
}
