package com.nocountry.qualitytrack.users.entity;

import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Column(name = "email_verified_at")
    private Instant emailVerifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private User(String firstName, String lastName, String email, String passwordHash,
                 AccountType accountType, UserStatus status) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.accountType = accountType;
        this.status = status;
    }

    public static User registerCustomer(String firstName, String lastName, String email, String passwordHash) {
        return new User(
                firstName,
                lastName,
                email,
                passwordHash,
                AccountType.CUSTOMER,
                UserStatus.PENDING_VERIFICATION
        );
    }

    public static User createActiveInternal(String firstName, String lastName, String email, String passwordHash) {
        return new User(
                firstName,
                lastName,
                email,
                passwordHash,
                AccountType.INTERNAL,
                UserStatus.ACTIVE
        );
    }

    public static User inviteInternal(String firstName, String lastName, String email, String temporaryPasswordHash) {
        return new User(
                firstName,
                lastName,
                email,
                temporaryPasswordHash,
                AccountType.INTERNAL,
                UserStatus.PENDING_ACTIVATION
        );
    }

    public void refreshPendingInternalInvitation(String firstName, String lastName) {
        if (accountType != AccountType.INTERNAL || status != UserStatus.PENDING_ACTIVATION) {
            throw new IllegalStateException("Solo una cuenta interna pendiente puede volver a invitarse.");
        }

        this.firstName = firstName;
        this.lastName = lastName;
    }

    public void activateInternal(String passwordHash, Instant activatedAt) {
        if (accountType != AccountType.INTERNAL || status != UserStatus.PENDING_ACTIVATION) {
            throw new IllegalStateException("Solo una cuenta interna pendiente puede activarse.");
        }

        this.passwordHash = passwordHash;
        this.status = UserStatus.ACTIVE;
        this.emailVerifiedAt = activatedAt;
    }

    public void verifyEmail(Instant verifiedAt) {
        this.status = UserStatus.ACTIVE;
        this.emailVerifiedAt = verifiedAt;
    }

    public void changePassword(String passwordHash) {
        this.passwordHash = passwordHash;
    }
}
