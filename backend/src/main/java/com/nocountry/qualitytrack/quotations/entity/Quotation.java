package com.nocountry.qualitytrack.quotations.entity;

import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Entity
@Table(name = "quotations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Quotation {

    private static final BigDecimal DEFAULT_TAX_RATE = new BigDecimal("16.0000");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false)
    private JobCase jobCase;

    @Column(name = "quotation_number", nullable = false, length = 30)
    private String quotationNumber;

    @Column(nullable = false)
    private Integer revision;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuotationStatus status;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "tax_rate", nullable = false, precision = 7, scale = 4)
    private BigDecimal taxRate;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal tax;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    @Column(name = "adjustment_notes", columnDefinition = "TEXT")
    private String adjustmentNotes;

    @Column(name = "adjustment_response", columnDefinition = "TEXT")
    private String adjustmentResponse;

    @Column(name = "sent_at")
    private Instant sentAt;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "rejected_at")
    private Instant rejectedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by_user_id")
    private User cancelledByUser;

    @Column(name = "cancelled_at")
    private Instant cancelledAt;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @OneToMany(mappedBy = "quotation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("lineNumber ASC")
    private List<QuotationItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private Quotation(
            JobCase jobCase,
            String quotationNumber,
            Integer revision,
            User createdByUser,
            String adjustmentNotes
    ) {
        this.jobCase = Objects.requireNonNull(jobCase);
        this.quotationNumber = requireText(quotationNumber, "El número de cotización es obligatorio.");
        this.revision = Objects.requireNonNull(revision);
        this.createdByUser = Objects.requireNonNull(createdByUser);
        this.adjustmentNotes = normalizeOptional(adjustmentNotes);
        this.status = QuotationStatus.DRAFT;
        this.currency = "MXN";
        this.subtotal = BigDecimal.ZERO.setScale(2);
        this.taxRate = DEFAULT_TAX_RATE;
        this.tax = BigDecimal.ZERO.setScale(2);
        this.total = BigDecimal.ZERO.setScale(2);
    }

    public static Quotation draft(
            JobCase jobCase,
            String quotationNumber,
            User createdByUser
    ) {
        return new Quotation(jobCase, quotationNumber, 1, createdByUser, null);
    }

    public static Quotation revisedFrom(
            Quotation previous,
            User createdByUser,
            String adjustmentNotes
    ) {
        Objects.requireNonNull(previous);
        if (previous.status != QuotationStatus.SENT) {
            throw new IllegalStateException("Solo una revisión SENT puede generar una nueva revisión.");
        }

        return copyRevision(previous, createdByUser, adjustmentNotes);
    }

    public static Quotation reissuedFrom(
            Quotation previous,
            User createdByUser
    ) {
        Objects.requireNonNull(previous);
        if (previous.status != QuotationStatus.EXPIRED
                && previous.status != QuotationStatus.CANCELLED
                && previous.status != QuotationStatus.REJECTED) {
            throw new IllegalStateException(
                    "Solo una revisión EXPIRED, CANCELLED o REJECTED puede reemitirse."
            );
        }

        Quotation next = copyRevision(previous, createdByUser, null);
        if (previous.status == QuotationStatus.EXPIRED) {
            next.validUntil = null;
        }
        return next;
    }

    private static Quotation copyRevision(
            Quotation previous,
            User createdByUser,
            String adjustmentNotes
    ) {
        Quotation next = new Quotation(
                previous.jobCase,
                previous.quotationNumber,
                previous.revision + 1,
                createdByUser,
                adjustmentNotes
        );
        next.currency = previous.currency;
        next.subtotal = previous.subtotal;
        next.taxRate = previous.taxRate;
        next.tax = previous.tax;
        next.total = previous.total;
        next.validUntil = previous.validUntil;
        next.estimatedDeliveryDate = previous.estimatedDeliveryDate;
        next.items = previous.items.stream()
                .map(item -> QuotationItem.copyTo(next, item))
                .toList();
        next.items = new ArrayList<>(next.items);
        return next;
    }

    public void replaceDraftContent(
            String currency,
            BigDecimal taxRate,
            LocalDate validUntil,
            LocalDate estimatedDeliveryDate,
            List<QuotationItem> replacementItems,
            BigDecimal subtotal,
            BigDecimal tax,
            BigDecimal total
    ) {
        requireDraft();

        this.currency = requireText(currency, "La moneda es obligatoria.")
                .toUpperCase(Locale.ROOT);
        this.taxRate = Objects.requireNonNull(taxRate);
        this.validUntil = validUntil;
        this.estimatedDeliveryDate = estimatedDeliveryDate;
        this.subtotal = Objects.requireNonNull(subtotal);
        this.tax = Objects.requireNonNull(tax);
        this.total = Objects.requireNonNull(total);

        List<QuotationItem> normalizedItems = replacementItems == null
                ? List.of()
                : replacementItems;

        for (QuotationItem item : normalizedItems) {
            if (item.getQuotation() != this) {
                throw new IllegalArgumentException("El concepto no pertenece a esta cotización.");
            }
        }

        this.items.removeIf(item -> !normalizedItems.contains(item));
        for (QuotationItem item : normalizedItems) {
            if (!this.items.contains(item)) {
                this.items.add(item);
            }
        }
        this.items.sort(Comparator.comparing(QuotationItem::getLineNumber));
    }

    public void recordAdjustmentResponse(String response) {
        requireDraft();
        this.adjustmentResponse = normalizeOptional(response);
    }

    public void send(Instant sentAt) {
        requireDraft();
        this.sentAt = Objects.requireNonNull(sentAt);
        this.status = QuotationStatus.SENT;
    }

    public void supersede() {
        requireStatus(QuotationStatus.SENT, "Solo una revisión SENT puede quedar SUPERSEDED.");
        this.status = QuotationStatus.SUPERSEDED;
    }

    public void approve(Instant approvedAt) {
        requireStatus(QuotationStatus.SENT, "Solo una revisión SENT puede aprobarse.");
        this.approvedAt = Objects.requireNonNull(approvedAt);
        this.status = QuotationStatus.APPROVED;
    }

    public void reject(String reason, Instant rejectedAt) {
        requireStatus(QuotationStatus.SENT, "Solo una revisión SENT puede rechazarse.");
        this.rejectionReason = normalizeOptional(reason);
        this.rejectedAt = Objects.requireNonNull(rejectedAt);
        this.status = QuotationStatus.REJECTED;
    }

    public void expire() {
        requireStatus(QuotationStatus.SENT, "Solo una revisión SENT puede expirar.");
        this.status = QuotationStatus.EXPIRED;
    }

    public boolean canBeCancelled() {
        return status == QuotationStatus.DRAFT || status == QuotationStatus.SENT;
    }

    public void cancel(User cancelledByUser, String reason, Instant cancelledAt) {
        if (!canBeCancelled()) {
            throw new IllegalStateException("La cotización no se encuentra en un estado cancelable.");
        }

        this.cancelledByUser = Objects.requireNonNull(cancelledByUser);
        this.cancellationReason = normalizeOptional(reason);
        this.cancelledAt = Objects.requireNonNull(cancelledAt);
        this.status = QuotationStatus.CANCELLED;
    }

    public boolean isExpiredOn(LocalDate date) {
        return status == QuotationStatus.SENT
                && validUntil != null
                && validUntil.isBefore(Objects.requireNonNull(date));
    }

    private void requireDraft() {
        requireStatus(QuotationStatus.DRAFT, "Solo una revisión DRAFT puede modificarse.");
    }

    private void requireStatus(QuotationStatus expected, String message) {
        if (status != expected) {
            throw new IllegalStateException(message);
        }
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
