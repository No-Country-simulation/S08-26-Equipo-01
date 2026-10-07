package com.nocountry.qualitytrack.requests.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(description = "Metadata opcional asociada a un documento de solicitud.")
public record CreateRequestDocument(
        @Size(max = 50)
        @Schema(
                description = "Tipo canónico opcional. Si se omite, se usa REQUEST_ATTACHMENT.",
                example = "TECHNICAL_DRAWING"
        )
        String documentType,

        @Size(max = 255)
        @Schema(
                description = "Nombre lógico opcional. Si se omite, se usa el nombre original del archivo.",
                example = "Plano técnico del eje"
        )
        String name,

        @Size(max = 2000)
        @Schema(
                description = "Descripción opcional del documento.",
                example = "Plano dimensional para cotización."
        )
        String description
) {
}
