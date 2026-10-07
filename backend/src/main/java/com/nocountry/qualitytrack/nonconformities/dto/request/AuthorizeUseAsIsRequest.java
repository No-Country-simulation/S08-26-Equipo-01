package com.nocountry.qualitytrack.nonconformities.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AuthorizeUseAsIsRequest(
        @NotBlank @Size(max = 4000) String reason
) {
}
