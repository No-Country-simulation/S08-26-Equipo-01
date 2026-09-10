package com.nocountry.qualitytrack.customers.entity;

import com.nocountry.qualitytrack.customers.enums.CustomerInvitationStatus;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
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

import java.time.Instant;

@Entity
@Table(name = "customer_invitations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerMembershipRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerInvitationStatus status;

    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invited_by_user_id", nullable = false)
    private User invitedByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by_user_id")
    private User acceptedByUser;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    private CustomerInvitation(
            Customer customer,
            String email,
            CustomerMembershipRole role,
            String tokenHash,
            Instant expiresAt,
            User invitedByUser
    ) {
        this.customer = customer;
        this.email = email;
        this.role = role;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.invitedByUser = invitedByUser;
        this.status = CustomerInvitationStatus.PENDING;
    }

    public static CustomerInvitation create(
            Customer customer,
            String email,
            CustomerMembershipRole role,
            String tokenHash,
            Instant expiresAt,
            User invitedByUser
    ) {
        return new CustomerInvitation(customer, email, role, tokenHash, expiresAt, invitedByUser);
    }

    public boolean isExpired(Instant now) {
        return !expiresAt.isAfter(now);
    }

    public void markExpired() {
        if (status == CustomerInvitationStatus.PENDING) {
            status = CustomerInvitationStatus.EXPIRED;
        }
    }

    public void accept(User acceptedByUser, Instant acceptedAt) {
        if (status != CustomerInvitationStatus.PENDING) {
            throw new IllegalStateException("Solo una invitación pendiente puede aceptarse.");
        }

        this.status = CustomerInvitationStatus.ACCEPTED;
        this.acceptedByUser = acceptedByUser;
        this.acceptedAt = acceptedAt;
    }
}
