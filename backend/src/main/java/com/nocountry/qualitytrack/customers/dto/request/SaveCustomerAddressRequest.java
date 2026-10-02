package com.nocountry.qualitytrack.customers.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SaveCustomerAddressRequest(
        @NotBlank @Size(max = 120) String label,
        @NotBlank @Size(max = 300) String address,
        @NotBlank @Size(max = 120) String city,
        @NotBlank @Size(max = 120) String state,
        @NotBlank @Size(max = 20) String postalCode,
        @NotBlank @Size(max = 100) String country,
        @Size(max = 160) String contactName,
        @Size(max = 30) String contactPhone,
        @Size(max = 1000) String deliveryInstructions,
        boolean defaultAddress
) {
}
