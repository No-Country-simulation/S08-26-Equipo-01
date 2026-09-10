package com.nocountry.qualitytrack.requests.entity;

import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "job_cases")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "request_id", nullable = false, unique = true)
    private CustomerRequest customerRequest;

    @Column(name = "case_number", nullable = false, length = 30, unique = true)
    private String caseNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobCaseStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedToUser;

    @Column(name = "assigned_at")
    private Instant assignedAt;

    @Column(name = "opened_at", nullable = false)
    private Instant openedAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by_user_id")
    private User cancelledByUser;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private JobCase(CustomerRequest customerRequest, String caseNumber, Instant openedAt) {
        this.customerRequest = customerRequest;
        this.caseNumber = caseNumber;
        this.status = JobCaseStatus.SUBMITTED;
        this.openedAt = openedAt;
    }

    public static JobCase open(CustomerRequest customerRequest, String caseNumber, Instant openedAt) {
        return new JobCase(customerRequest, caseNumber, openedAt);
    }

    public boolean canBeCancelled() {
        return status == JobCaseStatus.SUBMITTED
                || status == JobCaseStatus.UNDER_REVIEW
                || status == JobCaseStatus.WAITING_CUSTOMER_INFO;
    }

    public void cancel(User cancelledByUser, String cancellationReason, Instant cancelledAt) {
        if (!canBeCancelled()) {
            throw new IllegalStateException("El expediente no se encuentra en un estado cancelable.");
        }

        this.cancelledByUser = Objects.requireNonNull(cancelledByUser);
        this.cancelledAt = Objects.requireNonNull(cancelledAt);
        this.cancellationReason = cancellationReason;
        this.closedAt = cancelledAt;
        this.status = JobCaseStatus.CANCELLED;
    }
}
