package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.customers.entity.CustomerInvitation;
import com.nocountry.qualitytrack.customers.enums.CustomerInvitationStatus;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;

import java.time.Instant;

public record CustomerInvitationResponse(
        Long id,
        Long customerId,
        String email,
        CustomerMembershipRole role,
        CustomerInvitationStatus status,
        Instant expiresAt,
        Instant createdAt
) {
    public static CustomerInvitationResponse from(CustomerInvitation invitation) {
        return new CustomerInvitationResponse(
                invitation.getId(),
                invitation.getCustomer().getId(),
                invitation.getEmail(),
                invitation.getRole(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                invitation.getCreatedAt()
        );
    }
}
