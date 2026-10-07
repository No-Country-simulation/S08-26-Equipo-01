package com.nocountry.qualitytrack.customers.dto.request;

import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import jakarta.validation.constraints.NotNull;

public record UpdateCustomerMemberRoleRequest(
        @NotNull CustomerMembershipRole role
) {
}
