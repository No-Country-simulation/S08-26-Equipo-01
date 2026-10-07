package com.nocountry.qualitytrack.customers.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "customer_addresses")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false, length = 120)
    private String label;

    @Column(nullable = false, length = 300)
    private String address;

    @Column(nullable = false, length = 120)
    private String city;

    @Column(nullable = false, length = 120)
    private String state;

    @Column(name = "postal_code", nullable = false, length = 20)
    private String postalCode;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(name = "contact_name", length = 160)
    private String contactName;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "delivery_instructions", length = 1000)
    private String deliveryInstructions;

    @Column(name = "is_default", nullable = false)
    private boolean defaultAddress;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private CustomerAddress(
            Customer customer,
            String label,
            String address,
            String city,
            String state,
            String postalCode,
            String country,
            String contactName,
            String contactPhone,
            String deliveryInstructions,
            boolean defaultAddress
    ) {
        this.customer = Objects.requireNonNull(customer);
        update(
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
        this.defaultAddress = defaultAddress;
    }

    public static CustomerAddress create(
            Customer customer,
            String label,
            String address,
            String city,
            String state,
            String postalCode,
            String country,
            String contactName,
            String contactPhone,
            String deliveryInstructions,
            boolean defaultAddress
    ) {
        return new CustomerAddress(
                customer,
                label,
                address,
                city,
                state,
                postalCode,
                country,
                contactName,
                contactPhone,
                deliveryInstructions,
                defaultAddress
        );
    }

    public void update(
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
        this.label = requireText(label, "El nombre de la dirección es obligatorio.");
        this.address = requireText(address, "La dirección es obligatoria.");
        this.city = requireText(city, "La ciudad es obligatoria.");
        this.state = requireText(state, "El estado es obligatorio.");
        this.postalCode = requireText(postalCode, "El código postal es obligatorio.");
        this.country = requireText(country, "El país es obligatorio.");
        this.contactName = normalizeOptional(contactName);
        this.contactPhone = normalizeOptional(contactPhone);
        this.deliveryInstructions = normalizeOptional(deliveryInstructions);
    }

    public void setDefaultAddress(boolean defaultAddress) {
        this.defaultAddress = defaultAddress;
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
