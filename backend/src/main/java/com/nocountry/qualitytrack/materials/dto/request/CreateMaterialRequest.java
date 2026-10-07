package com.nocountry.qualitytrack.materials.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateMaterialRequest(
        @NotBlank @Size(max = 50) String code,
        @NotBlank @Size(max = 255) String name,
        @Size(max = 500) String specification,
        @NotBlank @Size(max = 20) String unit
) {
}
