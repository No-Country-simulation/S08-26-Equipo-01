package com.nocountry.qualitytrack.quotations.entity;

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

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "quotation_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuotationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quotation_id", nullable = false)
    private Quotation quotation;

    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit_price", nullable = false, precision = 14, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal subtotal;

    private QuotationItem(
            Quotation quotation,
            Integer lineNumber,
            String description,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {
        this.quotation = Objects.requireNonNull(quotation);
        this.lineNumber = Objects.requireNonNull(lineNumber);
        this.description = requireText(description, "La descripción del concepto es obligatoria.");
        this.quantity = Objects.requireNonNull(quantity);
        this.unitPrice = Objects.requireNonNull(unitPrice);
        this.subtotal = Objects.requireNonNull(subtotal);
    }

    public static QuotationItem create(
            Quotation quotation,
            Integer lineNumber,
            String description,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {
        return new QuotationItem(
                quotation,
                lineNumber,
                description,
                quantity,
                unitPrice,
                subtotal
        );
    }

    public void updateDetails(
            Integer lineNumber,
            String description,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {
        this.lineNumber = Objects.requireNonNull(lineNumber);
        this.description = requireText(description, "La descripción del concepto es obligatoria.");
        this.quantity = Objects.requireNonNull(quantity);
        this.unitPrice = Objects.requireNonNull(unitPrice);
        this.subtotal = Objects.requireNonNull(subtotal);
    }

    static QuotationItem copyTo(Quotation quotation, QuotationItem source) {
        return create(
                quotation,
                source.lineNumber,
                source.description,
                source.quantity,
                source.unitPrice,
                source.subtotal
        );
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
