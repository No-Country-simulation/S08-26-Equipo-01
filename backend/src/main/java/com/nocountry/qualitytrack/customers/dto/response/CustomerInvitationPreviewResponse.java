package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.customers.entity.CustomerInvitation;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;

import java.time.Instant;

public record CustomerInvitationPreviewResponse(
        String customerName,
        CustomerMembershipRole role,
        Instant expiresAt
) {
    public static CustomerInvitationPreviewResponse from(CustomerInvitation invitation) {
        return new CustomerInvitationPreviewResponse(
                invitation.getCustomer().getName(),
                invitation.getRole(),
                invitation.getExpiresAt()
        );
    }
}
