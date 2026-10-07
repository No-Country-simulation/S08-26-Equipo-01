package com.nocountry.qualitytrack.documents.dto.response;

import com.nocountry.qualitytrack.documents.enums.DocumentContext;

public record DocumentReferenceResponse(
        DocumentContext context,
        Long resourceId,
        Long documentVersionId,
        Integer version
) {
}
