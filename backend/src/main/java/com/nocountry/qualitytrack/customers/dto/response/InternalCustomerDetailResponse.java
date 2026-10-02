package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.requests.dto.response.JobCaseResponse;

import java.util.List;

public record InternalCustomerDetailResponse(
        InternalCustomerSummaryResponse customer,
        List<CustomerMemberResponse> members,
        List<JobCaseResponse> jobCases
) {
}
