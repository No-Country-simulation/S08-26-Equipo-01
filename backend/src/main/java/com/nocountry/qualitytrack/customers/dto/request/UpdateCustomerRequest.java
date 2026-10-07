package com.nocountry.qualitytrack.customers.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateCustomerRequest(
        @Size(max = 200)
        String name,

        @Size(max = 50)
        String rfc,

        @Size(max = 30)
        String phone,

        @Email
        @Size(max = 254)
        String administrativeEmail,

        @Size(max = 120)
        String city,

        @Size(max = 120)
        String state,

        @Size(max = 255)
        String website
) {
}
