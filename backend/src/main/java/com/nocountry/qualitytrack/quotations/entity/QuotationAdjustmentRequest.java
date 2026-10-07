package com.nocountry.qualitytrack.quotations.entity;

import com.nocountry.qualitytrack.quotations.enums.QuotationAdjustmentStatus;
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

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "quotation_adjustment_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuotationAdjustmentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "source_quotation_id", nullable = false)
    private Quotation sourceQuotation;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "draft_quotation_id", nullable = false, unique = true)
    private Quotation draftQuotation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_user_id")
    private User requestedByUser;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuotationAdjustmentStatus status;

    @CreationTimestamp
    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(columnDefinition = "TEXT")
    private String response;

    private QuotationAdjustmentRequest(
            Quotation sourceQuotation,
            Quotation draftQuotation,
            User requestedByUser,
            String notes
    ) {
        this.sourceQuotation = Objects.requireNonNull(sourceQuotation);
        this.draftQuotation = Objects.requireNonNull(draftQuotation);
        this.requestedByUser = requestedByUser;
        this.notes = requireText(notes);
        this.status = QuotationAdjustmentStatus.OPEN;
    }

    public static QuotationAdjustmentRequest open(
            Quotation sourceQuotation,
            Quotation draftQuotation,
            User requestedByUser,
            String notes
    ) {
        return new QuotationAdjustmentRequest(
                sourceQuotation,
                draftQuotation,
                requestedByUser,
                notes
        );
    }

    public void resolve(String response, Instant resolvedAt) {
        if (status != QuotationAdjustmentStatus.OPEN) {
            throw new IllegalStateException("La solicitud de ajuste ya fue resuelta.");
        }
        this.response = requireText(response);
        this.resolvedAt = Objects.requireNonNull(resolvedAt);
        this.status = QuotationAdjustmentStatus.RESOLVED;
    }

    private static String requireText(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("El texto de la solicitud de ajuste es obligatorio.");
        }
        return value.trim();
    }
}
