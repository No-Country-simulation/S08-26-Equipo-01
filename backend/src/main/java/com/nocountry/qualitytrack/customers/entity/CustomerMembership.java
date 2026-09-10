package com.nocountry.qualitytrack.customers.entity;

import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
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
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(
        name = "customer_memberships",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_customer_memberships_customer_user",
                columnNames = {"customer_id", "user_id"}
        )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CustomerMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerMembershipRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerMembershipStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by_user_id")
    private User invitedByUser;

    @Column(name = "joined_at")
    private Instant joinedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "removed_by_user_id")
    private User removedByUser;

    @Column(name = "removed_at")
    private Instant removedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    private CustomerMembership(
            Customer customer,
            User user,
            CustomerMembershipRole role,
            CustomerMembershipStatus status,
            User invitedByUser,
            Instant joinedAt
    ) {
        this.customer = customer;
        this.user = user;
        this.role = role;
        this.status = status;
        this.invitedByUser = invitedByUser;
        this.joinedAt = joinedAt;
    }

    public static CustomerMembership initialAdmin(Customer customer, User user, Instant joinedAt) {
        return new CustomerMembership(
                customer,
                user,
                CustomerMembershipRole.ADMIN,
                CustomerMembershipStatus.ACTIVE,
                null,
                joinedAt
        );
    }

    public static CustomerMembership acceptedInvitation(
            Customer customer,
            User user,
            CustomerMembershipRole role,
            User invitedByUser,
            Instant joinedAt
    ) {
        return new CustomerMembership(
                customer,
                user,
                role,
                CustomerMembershipStatus.ACTIVE,
                invitedByUser,
                joinedAt
        );
    }

    public void activateFromInvitation(
            CustomerMembershipRole role,
            User invitedByUser,
            Instant joinedAt
    ) {
        if (status == CustomerMembershipStatus.ACTIVE) {
            throw new IllegalStateException("La membresía ya está activa.");
        }

        this.role = role;
        this.status = CustomerMembershipStatus.ACTIVE;
        this.invitedByUser = invitedByUser;
        this.joinedAt = joinedAt;
        this.removedByUser = null;
        this.removedAt = null;
    }

    public void remove(User removedByUser, Instant removedAt) {
        if (status != CustomerMembershipStatus.ACTIVE) {
            throw new IllegalStateException("Solo una membresía activa puede retirarse.");
        }

        this.status = CustomerMembershipStatus.REMOVED;
        this.removedByUser = removedByUser;
        this.removedAt = removedAt;
    }
}
