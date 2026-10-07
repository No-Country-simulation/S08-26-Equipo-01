package com.nocountry.qualitytrack.deliveries.dto.response;

import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;

import java.time.Instant;

public record CustomerDeliveryResponse(
        Long id,
        String workOrderNumber,
        Integer quantity,
        DeliveryStatus status,
        String destinationLabel,
        String destinationContactName,
        String destinationAddress,
        String destinationCity,
        String destinationState,
        String destinationPostalCode,
        String destinationCountry,
        String destinationInstructions,
        String deliveryMethod,
        String carrier,
        String trackingNumber,
        Instant dispatchedAt,
        Instant deliveredAt,
        String receivedByName,
        Long evidenceDocumentId,
        Long evidenceDocumentVersionId,
        String evidenceFileName
) {
    public static CustomerDeliveryResponse from(DeliveryResponse delivery) {
        return new CustomerDeliveryResponse(
                delivery.id(),
                delivery.workOrderNumber(),
                delivery.quantity(),
                delivery.status(),
                delivery.destinationLabel(),
                delivery.destinationContactName(),
                delivery.destinationAddress(),
                delivery.destinationCity(),
                delivery.destinationState(),
                delivery.destinationPostalCode(),
                delivery.destinationCountry(),
                delivery.destinationInstructions(),
                delivery.deliveryMethod(),
                delivery.carrier(),
                delivery.trackingNumber(),
                delivery.dispatchedAt(),
                delivery.deliveredAt(),
                delivery.receivedByName(),
                delivery.evidenceDocumentId(),
                delivery.evidenceDocumentVersionId(),
                delivery.evidenceFileName()
        );
    }
}
