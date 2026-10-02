package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.enums.CustomerStatus;

import java.time.Instant;

public record InternalCustomerSummaryResponse(
        Long id,
        String name,
        String rfc,
        String phone,
        String administrativeEmail,
        String city,
        String state,
        String website,
        CustomerStatus status,
        long activeMembers,
        long openCases,
        long completedCases,
        long cancelledCases,
        Instant createdAt
) {
    public static InternalCustomerSummaryResponse from(
            Customer customer,
            long activeMembers,
            long openCases,
            long completedCases,
            long cancelledCases
    ) {
        return new InternalCustomerSummaryResponse(
                customer.getId(),
                customer.getName(),
                customer.getRfc(),
                customer.getPhone(),
                customer.getAdministrativeEmail(),
                customer.getCity(),
                customer.getState(),
                customer.getWebsite(),
                customer.getStatus(),
                activeMembers,
                openCases,
                completedCases,
                cancelledCases,
                customer.getCreatedAt()
        );
    }
}
