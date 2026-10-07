package com.nocountry.qualitytrack.customers.entity;

import com.nocountry.qualitytrack.customers.enums.CustomerStatus;
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

@Entity
@Table(name = "customers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String rfc;

    private String phone;

    @Column(name = "administrative_email")
    private String administrativeEmail;

    private String city;

    private String state;

    private String website;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerStatus status;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private Customer(
            String name,
            String rfc,
            String phone,
            String administrativeEmail,
            String city,
            String state,
            String website,
            User createdByUser
    ) {
        this.name = name;
        this.rfc = rfc;
        this.phone = phone;
        this.administrativeEmail = administrativeEmail;
        this.city = city;
        this.state = state;
        this.website = website;
        this.status = CustomerStatus.ACTIVE;
        this.createdByUser = createdByUser;
    }

    public static Customer create(
            String name,
            String rfc,
            String phone,
            String administrativeEmail,
            String city,
            String state,
            String website,
            User createdByUser
    ) {
        return new Customer(name, rfc, phone, administrativeEmail, city, state, website, createdByUser);
    }

    public void updateDetails(
            String name,
            String rfc,
            String phone,
            String administrativeEmail,
            String city,
            String state,
            String website
    ) {
        this.name = name;
        this.rfc = rfc;
        this.phone = phone;
        this.administrativeEmail = administrativeEmail;
        this.city = city;
        this.state = state;
        this.website = website;
    }
}
