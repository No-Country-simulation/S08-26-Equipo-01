package com.nocountry.qualitytrack.search.dto.response;

import java.util.List;

public record InternalSearchResponse(
        String query,
        List<InternalSearchResultResponse> results
) {
}
