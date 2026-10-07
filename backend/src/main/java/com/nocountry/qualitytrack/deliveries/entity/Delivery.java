package com.nocountry.qualitytrack.deliveries.entity;

import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "deliveries")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeliveryStatus status;

    @Column(name = "destination_label", length = 120)
    private String destinationLabel;

    @Column(name = "destination_recipient_name", length = 160)
    private String destinationContactName;

    @Column(name = "destination_address", nullable = false, length = 300)
    private String destinationAddress;

    @Column(name = "destination_city", nullable = false, length = 120)
    private String destinationCity;

    @Column(name = "destination_state", nullable = false, length = 120)
    private String destinationState;

    @Column(name = "destination_postal_code", nullable = false, length = 20)
    private String destinationPostalCode;

    @Column(name = "destination_country", nullable = false, length = 100)
    private String destinationCountry;

    @Column(name = "destination_instructions", length = 1000)
    private String destinationInstructions;

    @Column(name = "delivery_method", nullable = false, length = 80)
    private String deliveryMethod;

    @Column(length = 120)
    private String carrier;

    @Column(name = "tracking_number", length = 160)
    private String trackingNumber;

    @Column(name = "dispatched_at")
    private Instant dispatchedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispatched_by_user_id")
    private User dispatchedByUser;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "received_by_name", length = 160)
    private String receivedByName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivered_by_user_id")
    private User deliveredByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evidence_document_version_id")
    private DocumentVersion evidenceDocumentVersion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by_user_id")
    private User cancelledByUser;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private Delivery(
            WorkOrder workOrder,
            Integer quantity,
            String destinationLabel,
            String destinationContactName,
            String destinationAddress,
            String destinationCity,
            String destinationState,
            String destinationPostalCode,
            String destinationCountry,
            String destinationInstructions,
            String deliveryMethod,
            User createdByUser
    ) {
        this.workOrder = Objects.requireNonNull(workOrder);
        if (workOrder.getStatus() != WorkOrderStatus.READY_FOR_DELIVERY) {
            throw new IllegalStateException("Solo una orden READY_FOR_DELIVERY puede preparar entregas.");
        }
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("La cantidad de la entrega debe ser mayor a cero.");
        }
        this.quantity = quantity;
        this.destinationLabel = normalizeOptional(destinationLabel);
        this.destinationContactName = normalizeOptional(destinationContactName);
        this.destinationAddress = requireText(destinationAddress, "La dirección de destino es obligatoria.");
        this.destinationCity = requireText(destinationCity, "La ciudad de destino es obligatoria.");
        this.destinationState = requireText(destinationState, "El estado de destino es obligatorio.");
        this.destinationPostalCode = requireText(destinationPostalCode, "El código postal de destino es obligatorio.");
        this.destinationCountry = requireText(destinationCountry, "El país de destino es obligatorio.");
        this.destinationInstructions = normalizeOptional(destinationInstructions);
        this.deliveryMethod = requireText(deliveryMethod, "El método de entrega es obligatorio.");
        this.createdByUser = Objects.requireNonNull(createdByUser);
        this.status = DeliveryStatus.PENDING;
    }

    public static Delivery create(
            WorkOrder workOrder,
            Integer quantity,
            String destinationLabel,
            String destinationContactName,
            String destinationAddress,
            String destinationCity,
            String destinationState,
            String destinationPostalCode,
            String destinationCountry,
            String destinationInstructions,
            String deliveryMethod,
            User createdByUser
    ) {
        return new Delivery(
                workOrder,
                quantity,
                destinationLabel,
                destinationContactName,
                destinationAddress,
                destinationCity,
                destinationState,
                destinationPostalCode,
                destinationCountry,
                destinationInstructions,
                deliveryMethod,
                createdByUser
        );
    }

    public void dispatch(User actor, String carrier, String trackingNumber, Instant dispatchedAt) {
        if (status != DeliveryStatus.PENDING) {
            throw new IllegalStateException("Solo una entrega PENDING puede despacharse.");
        }
        this.carrier = normalizeOptional(carrier);
        this.trackingNumber = normalizeOptional(trackingNumber);
        this.dispatchedByUser = Objects.requireNonNull(actor);
        this.dispatchedAt = Objects.requireNonNull(dispatchedAt);
        this.status = DeliveryStatus.DISPATCHED;
    }

    public void attachEvidence(DocumentVersion evidenceDocumentVersion) {
        if (status != DeliveryStatus.PENDING && status != DeliveryStatus.DISPATCHED) {
            throw new IllegalStateException(
                    "La evidencia solo puede modificarse antes de confirmar la entrega."
            );
        }
        this.evidenceDocumentVersion = Objects.requireNonNull(evidenceDocumentVersion);
    }

    public void markDelivered(
            User actor,
            String receivedByName,
            Instant deliveredAt
    ) {
        if (status != DeliveryStatus.DISPATCHED) {
            throw new IllegalStateException("Solo una entrega DISPATCHED puede registrarse como entregada.");
        }

        Instant actualDeliveredAt = Objects.requireNonNull(deliveredAt);
        if (dispatchedAt == null || actualDeliveredAt.isBefore(dispatchedAt)) {
            throw new IllegalArgumentException(
                    "La fecha real de entrega no puede ser anterior al despacho."
            );
        }

        this.receivedByName = requireText(receivedByName, "El nombre de quien recibe es obligatorio.");
        this.deliveredByUser = Objects.requireNonNull(actor);
        this.deliveredAt = actualDeliveredAt;
        this.status = DeliveryStatus.DELIVERED;
    }

    public void cancel(User actor, String reason, Instant cancelledAt) {
        if (status != DeliveryStatus.PENDING && status != DeliveryStatus.DISPATCHED) {
            throw new IllegalStateException("Solo una entrega PENDING o DISPATCHED puede cancelarse.");
        }
        this.cancelledByUser = Objects.requireNonNull(actor);
        this.cancellationReason = requireText(reason, "El motivo de cancelación es obligatorio.");
        this.cancelledAt = Objects.requireNonNull(cancelledAt);
        this.status = DeliveryStatus.CANCELLED;
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private static String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
