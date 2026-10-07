package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.customers.entity.CustomerInvitation;
import com.nocountry.qualitytrack.customers.enums.CustomerInvitationAcceptOutcome;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;

public record CustomerInvitationAcceptResponse(
        CustomerInvitationAcceptOutcome outcome,
        String customerName,
        CustomerMembershipRole role
) {
    public static CustomerInvitationAcceptResponse accepted(CustomerInvitation invitation) {
        return from(invitation, CustomerInvitationAcceptOutcome.ACCEPTED);
    }

    public static CustomerInvitationAcceptResponse registrationRequired(CustomerInvitation invitation) {
        return from(invitation, CustomerInvitationAcceptOutcome.REGISTRATION_REQUIRED);
    }

    private static CustomerInvitationAcceptResponse from(
            CustomerInvitation invitation,
            CustomerInvitationAcceptOutcome outcome
    ) {
        return new CustomerInvitationAcceptResponse(
                outcome,
                invitation.getCustomer().getName(),
                invitation.getRole()
        );
    }
}
