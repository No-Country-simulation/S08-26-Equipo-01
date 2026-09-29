package com.nocountry.qualitytrack.deliveries.dto.response;

import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;

import java.time.Instant;

public record DeliveryResponse(
        Long id,
        Long workOrderId,
        String workOrderNumber,
        Integer quantity,
        DeliveryStatus status,
        String destinationRecipientName,
        String destinationAddress,
        String destinationCity,
        String destinationState,
        String destinationPostalCode,
        String destinationCountry,
        String deliveryMethod,
        String carrier,
        String trackingNumber,
        Instant dispatchedAt,
        Long dispatchedByUserId,
        Instant deliveredAt,
        String receivedByName,
        Long deliveredByUserId,
        Long evidenceDocumentId,
        Long evidenceDocumentVersionId,
        Long createdByUserId,
        Instant cancelledAt,
        Long cancelledByUserId,
        String cancellationReason,
        Instant createdAt,
        Instant updatedAt
) {
    public static DeliveryResponse from(Delivery delivery) {
        return new DeliveryResponse(
                delivery.getId(),
                delivery.getWorkOrder().getId(),
                delivery.getWorkOrder().getWorkOrderNumber(),
                delivery.getQuantity(),
                delivery.getStatus(),
                delivery.getDestinationRecipientName(),
                delivery.getDestinationAddress(),
                delivery.getDestinationCity(),
                delivery.getDestinationState(),
                delivery.getDestinationPostalCode(),
                delivery.getDestinationCountry(),
                delivery.getDeliveryMethod(),
                delivery.getCarrier(),
                delivery.getTrackingNumber(),
                delivery.getDispatchedAt(),
                delivery.getDispatchedByUser() == null ? null : delivery.getDispatchedByUser().getId(),
                delivery.getDeliveredAt(),
                delivery.getReceivedByName(),
                delivery.getDeliveredByUser() == null ? null : delivery.getDeliveredByUser().getId(),
                delivery.getEvidenceDocumentVersion() == null
                        ? null
                        : delivery.getEvidenceDocumentVersion().getDocument().getId(),
                delivery.getEvidenceDocumentVersion() == null ? null : delivery.getEvidenceDocumentVersion().getId(),
                delivery.getCreatedByUser().getId(),
                delivery.getCancelledAt(),
                delivery.getCancelledByUser() == null ? null : delivery.getCancelledByUser().getId(),
                delivery.getCancellationReason(),
                delivery.getCreatedAt(),
                delivery.getUpdatedAt()
        );
    }
}
