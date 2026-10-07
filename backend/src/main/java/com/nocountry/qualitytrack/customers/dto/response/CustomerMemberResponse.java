package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;

import java.time.Instant;

public record CustomerMemberResponse(
        Long membershipId,
        Long userId,
        String firstName,
        String lastName,
        String email,
        CustomerMembershipRole role,
        CustomerMembershipStatus status,
        Instant joinedAt,
        Instant createdAt
) {
    public static CustomerMemberResponse from(CustomerMembership membership) {
        return new CustomerMemberResponse(
                membership.getId(),
                membership.getUser().getId(),
                membership.getUser().getFirstName(),
                membership.getUser().getLastName(),
                membership.getUser().getEmail(),
                membership.getRole(),
                membership.getStatus(),
                membership.getJoinedAt(),
                membership.getCreatedAt()
        );
    }
}
