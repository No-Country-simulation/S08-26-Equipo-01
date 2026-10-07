package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.requests.entity.RequestDeliveryDestination;
import com.nocountry.qualitytrack.requests.enums.RequestDeliveryMode;

import java.time.Instant;

public record RequestDeliveryDestinationResponse(
        Long id,
        RequestDeliveryMode mode,
        Long sourceCustomerAddressId,
        String label,
        String address,
        String city,
        String state,
        String postalCode,
        String country,
        String contactName,
        String contactPhone,
        String deliveryInstructions,
        Instant createdAt
) {
    public static RequestDeliveryDestinationResponse from(
            RequestDeliveryDestination destination
    ) {
        if (destination == null) {
            return null;
        }

        return new RequestDeliveryDestinationResponse(
                destination.getId(),
                destination.getMode(),
                destination.getSourceCustomerAddress() == null
                        ? null
                        : destination.getSourceCustomerAddress().getId(),
                destination.getLabel(),
                destination.getAddress(),
                destination.getCity(),
                destination.getState(),
                destination.getPostalCode(),
                destination.getCountry(),
                destination.getContactName(),
                destination.getContactPhone(),
                destination.getDeliveryInstructions(),
                destination.getCreatedAt()
        );
    }
}
