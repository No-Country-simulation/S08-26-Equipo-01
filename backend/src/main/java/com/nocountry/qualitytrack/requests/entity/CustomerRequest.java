package com.nocountry.qualitytrack.requests.entity;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.users.entity.User;
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
import java.time.LocalDate;

@Entity
@Table(name = "customer_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "request_number", nullable = false, length = 30, unique = true)
    private String requestNumber;

    @Column(name = "customer_reference")
    private String customerReference;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "material_requirement_type", nullable = false)
    private MaterialRequirementType materialRequirementType;

    @Column(name = "material_requirement", nullable = false)
    private String materialRequirement;

    @Column(name = "requested_delivery_date")
    private LocalDate requestedDeliveryDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedByUser;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private CustomerRequest(
            Customer customer,
            String requestNumber,
            String customerReference,
            String title,
            String description,
            Integer quantity,
            MaterialRequirementType materialRequirementType,
            String materialRequirement,
            LocalDate requestedDeliveryDate,
            User requestedByUser
    ) {
        this.customer = customer;
        this.requestNumber = requestNumber;
        this.customerReference = customerReference;
        this.title = title;
        this.description = description;
        this.quantity = quantity;
        this.materialRequirementType = materialRequirementType;
        this.materialRequirement = materialRequirement;
        this.requestedDeliveryDate = requestedDeliveryDate;
        this.requestedByUser = requestedByUser;
    }

    public static CustomerRequest submit(
            Customer customer,
            String requestNumber,
            String customerReference,
            String title,
            String description,
            Integer quantity,
            MaterialRequirementType materialRequirementType,
            String materialRequirement,
            LocalDate requestedDeliveryDate,
            User requestedByUser
    ) {
        return new CustomerRequest(
                customer,
                requestNumber,
                customerReference,
                title,
                description,
                quantity,
                materialRequirementType,
                materialRequirement,
                requestedDeliveryDate,
                requestedByUser
        );
    }
}
