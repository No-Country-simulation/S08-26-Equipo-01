package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;

public record DocumentVersionMutationResult(
        DocumentVersionResponse version,
        String documentName
) {
}
