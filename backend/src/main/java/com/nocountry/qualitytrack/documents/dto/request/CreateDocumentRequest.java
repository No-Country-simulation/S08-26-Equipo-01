package com.nocountry.qualitytrack.documents.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateDocumentRequest(
        @NotNull Long caseId,
        @NotBlank @Size(max = 50) String documentType,
        @NotBlank @Size(max = 255) String name,
        @Size(max = 2000) String description
) {
}
