package com.nocountry.qualitytrack.requests.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DefineCaseMaterialSpecificationRequest(
        @NotBlank(message = "El material es obligatorio.")
        @Size(max = 255, message = "El material no puede exceder 255 caracteres.")
        String materialName,
        @Size(max = 255, message = "La norma o grado no puede exceder 255 caracteres.")
        String standardOrGrade,
        @Size(max = 4000, message = "Las notas técnicas no pueden exceder 4000 caracteres.")
        String technicalNotes
) {
}
