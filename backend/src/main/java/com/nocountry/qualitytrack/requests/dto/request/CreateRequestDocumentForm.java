package com.nocountry.qualitytrack.requests.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@Schema(description = "Documento adjunto a una solicitud. Agrupa metadata opcional y el archivo binario en una sola unidad.")
public class CreateRequestDocumentForm {

    @Size(max = 50)
    @Schema(
            description = "Tipo canónico opcional del documento. Si se omite, se usa REQUEST_ATTACHMENT.",
            example = "TECHNICAL_DRAWING"
    )
    private String documentType;

    @Size(max = 255)
    @Schema(
            description = "Nombre lógico opcional. Si se omite, se usa el nombre original del archivo.",
            example = "Plano técnico del eje"
    )
    private String name;

    @Size(max = 2000)
    @Schema(
            description = "Descripción opcional del documento.",
            example = "Plano actualizado con tolerancias dimensionales."
    )
    private String description;

    @NotNull
    @Schema(
            description = "Archivo del documento.",
            type = "string",
            format = "binary"
    )
    private MultipartFile file;

    public CreateRequestDocument toMetadata() {
        return new CreateRequestDocument(
                documentType,
                name,
                description
        );
    }
}
