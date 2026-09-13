package com.nocountry.qualitytrack.requests.dto.request;

import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@Schema(description = "Formulario multipart para enviar una solicitud de cliente junto con sus documentos iniciales y metadata opcional por documento.")
public class SubmitCustomerRequestForm {

    @Size(max = 120)
    @Schema(description = "Referencia interna opcional del cliente.", example = "OC-2026-0912-EJE-01")
    private String customerReference;

    @NotBlank
    @Size(max = 200)
    @Schema(description = "Título de la solicitud.", example = "Fabricación de eje de transmisión")
    private String title;

    @NotBlank
    @Size(max = 5000)
    @Schema(description = "Descripción detallada del trabajo solicitado.")
    private String description;

    @NotNull
    @Positive
    @Schema(description = "Cantidad de piezas requeridas.", example = "20")
    private Integer quantity;

    @NotNull
    @Schema(description = "Indica si el material fue especificado por el cliente o requiere asesoría.")
    private MaterialRequirementType materialRequirementType;

    @NotBlank
    @Size(max = 2000)
    @Schema(description = "Material, norma o requerimiento técnico asociado.", example = "Acero inoxidable AISI 304")
    private String materialRequirement;

    @FutureOrPresent
    @Schema(description = "Fecha solicitada de entrega.", example = "2026-09-25", type = "string", format = "date")
    private LocalDate requestedDeliveryDate;

    @Valid
    @ArraySchema(
            arraySchema = @Schema(description = "Documentos iniciales opcionales. Cada elemento agrupa documentType, name, description y file. El máximo se controla mediante DOCUMENT_MAX_FILES_PER_REQUEST (5 por defecto)."),
            schema = @Schema(implementation = CreateRequestDocumentForm.class)
    )
    private List<@NotNull CreateRequestDocumentForm> documents;

    public SubmitCustomerRequest toRequest() {
        return new SubmitCustomerRequest(
                customerReference,
                title,
                description,
                quantity,
                materialRequirementType,
                materialRequirement,
                requestedDeliveryDate
        );
    }
}
