package com.nocountry.qualitytrack.workorders.dto.response;

import com.nocountry.qualitytrack.documents.dto.response.DocumentCenterResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;

import java.util.List;

public record WorkOrder360DocumentResponse(
        DocumentCenterResponse document,
        List<DocumentVersionResponse> versions
) {
    public WorkOrder360DocumentResponse {
        versions = versions == null ? List.of() : List.copyOf(versions);
    }
}
