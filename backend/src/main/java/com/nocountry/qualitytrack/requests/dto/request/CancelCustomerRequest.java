package com.nocountry.qualitytrack.requests.dto.request;

import jakarta.validation.constraints.Size;

public record CancelCustomerRequest(
        @Size(max = 1000)
        String reason
) {
}
