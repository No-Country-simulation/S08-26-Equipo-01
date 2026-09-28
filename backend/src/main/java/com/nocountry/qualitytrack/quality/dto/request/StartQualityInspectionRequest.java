package com.nocountry.qualitytrack.quality.dto.request;

import jakarta.validation.constraints.Positive;

public record StartQualityInspectionRequest(
        @Positive Long inspectorId
) {
}
