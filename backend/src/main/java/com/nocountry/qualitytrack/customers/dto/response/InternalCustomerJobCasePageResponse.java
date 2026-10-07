package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.requests.dto.response.JobCaseResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public record InternalCustomerJobCasePageResponse(
        List<JobCaseResponse> items,
        int page,
        int pageSize,
        long totalItems,
        int totalPages
) {
    public static InternalCustomerJobCasePageResponse from(Page<JobCaseResponse> page) {
        return new InternalCustomerJobCasePageResponse(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
