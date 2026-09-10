package com.nocountry.qualitytrack.customers.dto.request;

import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateCustomerInvitationRequest(
        @NotBlank
        @Email
        @Size(max = 254)
        String email,

        @NotNull
        CustomerMembershipRole role
) {
}
