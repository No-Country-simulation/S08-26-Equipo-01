package com.nocountry.qualitytrack.customers.dto.response;

import java.util.List;

public record InternalCustomerDetailResponse(
        InternalCustomerSummaryResponse customer,
        List<CustomerMemberResponse> members
) {
}
