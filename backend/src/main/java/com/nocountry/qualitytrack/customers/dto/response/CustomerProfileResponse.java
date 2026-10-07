package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.UserStatus;

import java.time.Instant;
import java.util.List;

public record CustomerProfileResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        UserStatus status,
        List<CustomerContextResponse> memberships,
        Instant createdAt,
        Instant updatedAt
) {
    public static CustomerProfileResponse from(
            User user,
            List<CustomerMembership> memberships
    ) {
        return new CustomerProfileResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getStatus(),
                memberships.stream().map(CustomerContextResponse::from).toList(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
