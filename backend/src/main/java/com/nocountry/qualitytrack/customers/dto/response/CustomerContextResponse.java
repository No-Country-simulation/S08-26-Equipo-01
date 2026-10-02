package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;

import java.time.Instant;

public record CustomerContextResponse(
        Long customerId,
        String customerName,
        CustomerMembershipRole role,
        CustomerMembershipStatus status,
        Instant joinedAt
) {
    public static CustomerContextResponse from(CustomerMembership membership) {
        return new CustomerContextResponse(
                membership.getCustomer().getId(),
                membership.getCustomer().getName(),
                membership.getRole(),
                membership.getStatus(),
                membership.getJoinedAt()
        );
    }
}
