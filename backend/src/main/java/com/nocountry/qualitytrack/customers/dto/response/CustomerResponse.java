package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.enums.CustomerStatus;

import java.time.Instant;

public record CustomerResponse(
        Long id,
        String name,
        String rfc,
        String phone,
        String administrativeEmail,
        String city,
        String state,
        String website,
        CustomerStatus status,
        Instant createdAt
) {
    public static CustomerResponse from(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getName(),
                customer.getRfc(),
                customer.getPhone(),
                customer.getAdministrativeEmail(),
                customer.getCity(),
                customer.getState(),
                customer.getWebsite(),
                customer.getStatus(),
                customer.getCreatedAt()
        );
    }
}
