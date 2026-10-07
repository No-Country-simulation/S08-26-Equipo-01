package com.nocountry.qualitytrack.customers.dto.response;

import com.nocountry.qualitytrack.customers.entity.CustomerAddress;

import java.time.Instant;

public record CustomerAddressResponse(
        Long id,
        Long customerId,
        String label,
        String address,
        String city,
        String state,
        String postalCode,
        String country,
        String contactName,
        String contactPhone,
        String deliveryInstructions,
        boolean defaultAddress,
        Instant createdAt,
        Instant updatedAt
) {
    public static CustomerAddressResponse from(CustomerAddress address) {
        return new CustomerAddressResponse(
                address.getId(),
                address.getCustomer().getId(),
                address.getLabel(),
                address.getAddress(),
                address.getCity(),
                address.getState(),
                address.getPostalCode(),
                address.getCountry(),
                address.getContactName(),
                address.getContactPhone(),
                address.getDeliveryInstructions(),
                address.isDefaultAddress(),
                address.getCreatedAt(),
                address.getUpdatedAt()
        );
    }
}
