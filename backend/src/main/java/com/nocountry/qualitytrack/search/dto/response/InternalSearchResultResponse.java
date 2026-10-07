package com.nocountry.qualitytrack.search.dto.response;

import com.nocountry.qualitytrack.search.enums.InternalSearchResultType;

public record InternalSearchResultResponse(
        InternalSearchResultType type,
        Long resourceId,
        String title,
        String subtitle,
        String context,
        String status,
        String href
) {
}
