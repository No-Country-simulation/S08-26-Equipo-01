package com.nocountry.qualitytrack.requests.entity;

import com.nocountry.qualitytrack.customers.entity.CustomerAddress;
import com.nocountry.qualitytrack.requests.enums.RequestDeliveryMode;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "request_delivery_destinations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RequestDeliveryDestination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private CustomerRequest customerRequest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RequestDeliveryMode mode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_customer_address_id")
    private CustomerAddress sourceCustomerAddress;

    @Column(length = 120)
    private String label;

    @Column(length = 300)
    private String address;

    @Column(length = 120)
    private String city;

    @Column(length = 120)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(length = 100)
    private String country;

    @Column(name = "contact_name", length = 160)
    private String contactName;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "delivery_instructions", length = 1000)
    private String deliveryInstructions;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    private RequestDeliveryDestination(CustomerRequest request, RequestDeliveryMode mode) {
        this.customerRequest = Objects.requireNonNull(request);
        this.mode = Objects.requireNonNull(mode);
    }

    public static RequestDeliveryDestination fromSavedAddress(
            CustomerRequest request,
            CustomerAddress source,
            String contactName,
            String contactPhone,
            String deliveryInstructions
    ) {
        RequestDeliveryDestination destination =
                new RequestDeliveryDestination(request, RequestDeliveryMode.SAVED_ADDRESS);
        destination.sourceCustomerAddress = Objects.requireNonNull(source);
        destination.copyAddress(
                source.getLabel(),
                source.getAddress(),
                source.getCity(),
                source.getState(),
                source.getPostalCode(),
                source.getCountry(),
                normalizeOptional(contactName),
                normalizeOptional(contactPhone),
                normalizeOptional(deliveryInstructions)
        );
        request.attachDeliveryDestination(destination);
        return destination;
    }

    public static RequestDeliveryDestination customAddress(
            CustomerRequest request,
            String label,
            String address,
            String city,
            String state,
            String postalCode,
            String country,
            String contactName,
            String contactPhone,
            String deliveryInstructions
    ) {
        RequestDeliveryDestination destination =
                new RequestDeliveryDestination(request, RequestDeliveryMode.CUSTOM_ADDRESS);
        destination.copyAddress(
                label,
                address,
                city,
                state,
                postalCode,
                country,
                contactName,
                contactPhone,
                deliveryInstructions
        );
        request.attachDeliveryDestination(destination);
        return destination;
    }

    public static RequestDeliveryDestination pickup(CustomerRequest request) {
        RequestDeliveryDestination destination =
                new RequestDeliveryDestination(request, RequestDeliveryMode.CUSTOMER_PICKUP);
        destination.label = "Recolección en planta";
        request.attachDeliveryDestination(destination);
        return destination;
    }

    public static RequestDeliveryDestination defineLater(CustomerRequest request) {
        RequestDeliveryDestination destination =
                new RequestDeliveryDestination(request, RequestDeliveryMode.DEFINE_LATER);
        destination.label = "Destino por definir";
        request.attachDeliveryDestination(destination);
        return destination;
    }

    private void copyAddress(
            String label,
            String address,
            String city,
            String state,
            String postalCode,
            String country,
            String contactName,
            String contactPhone,
            String deliveryInstructions
    ) {
        this.label = normalizeOptional(label);
        this.address = requireText(address, "La dirección es obligatoria.");
        this.city = requireText(city, "La ciudad es obligatoria.");
        this.state = requireText(state, "El estado es obligatorio.");
        this.postalCode = requireText(postalCode, "El código postal es obligatorio.");
        this.country = requireText(country, "El país es obligatorio.");
        this.contactName = normalizeOptional(contactName);
        this.contactPhone = normalizeOptional(contactPhone);
        this.deliveryInstructions = normalizeOptional(deliveryInstructions);
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
