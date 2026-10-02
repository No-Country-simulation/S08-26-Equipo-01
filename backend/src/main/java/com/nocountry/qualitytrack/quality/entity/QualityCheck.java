package com.nocountry.qualitytrack.quality.entity;

import com.nocountry.qualitytrack.quality.enums.QualityCheckResult;
import com.nocountry.qualitytrack.quality.enums.QualityCheckType;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "quality_checks")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QualityCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quality_inspection_id", nullable = false)
    private QualityInspection qualityInspection;

    @Enumerated(EnumType.STRING)
    @Column(name = "check_type", nullable = false)
    private QualityCheckType type;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "nominal_value", precision = 18, scale = 6)
    private BigDecimal nominalValue;

    @Column(name = "lower_limit", precision = 18, scale = 6)
    private BigDecimal lowerLimit;

    @Column(name = "upper_limit", precision = 18, scale = 6)
    private BigDecimal upperLimit;

    @Column(name = "measured_value", precision = 18, scale = 6)
    private BigDecimal measuredValue;

    @Column(length = 20)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QualityCheckResult result;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private QualityCheck(QualityInspection qualityInspection) {
        this.qualityInspection = Objects.requireNonNull(qualityInspection);
    }

    public static QualityCheck createNumericRange(
            QualityInspection qualityInspection,
            String name,
            BigDecimal nominalValue,
            BigDecimal lowerLimit,
            BigDecimal upperLimit,
            BigDecimal measuredValue,
            String unit,
            String notes
    ) {
        requireOpenInspection(qualityInspection);
        QualityCheck check = new QualityCheck(qualityInspection);
        check.updateNumericRange(
                name,
                nominalValue,
                lowerLimit,
                upperLimit,
                measuredValue,
                unit,
                notes
        );
        return check;
    }

    public static QualityCheck createPassFail(
            QualityInspection qualityInspection,
            String name,
            QualityCheckResult result,
            String notes
    ) {
        requireOpenInspection(qualityInspection);
        QualityCheck check = new QualityCheck(qualityInspection);
        check.updatePassFail(name, result, notes);
        return check;
    }

    public void updateNumericRange(
            String name,
            BigDecimal nominalValue,
            BigDecimal lowerLimit,
            BigDecimal upperLimit,
            BigDecimal measuredValue,
            String unit,
            String notes
    ) {
        requireOpenInspection(qualityInspection);
        this.type = QualityCheckType.NUMERIC_RANGE;
        this.name = requireText(name, "El nombre del control es obligatorio.");
        this.nominalValue = Objects.requireNonNull(nominalValue);
        this.lowerLimit = Objects.requireNonNull(lowerLimit);
        this.upperLimit = Objects.requireNonNull(upperLimit);
        this.measuredValue = Objects.requireNonNull(measuredValue);
        this.unit = requireText(unit, "La unidad de medida es obligatoria.");
        this.notes = normalizeOptional(notes);

        if (this.lowerLimit.compareTo(this.upperLimit) > 0) {
            throw new IllegalArgumentException(
                    "El límite inferior no puede ser mayor al límite superior."
            );
        }
        if (this.nominalValue.compareTo(this.lowerLimit) < 0
                || this.nominalValue.compareTo(this.upperLimit) > 0) {
            throw new IllegalArgumentException(
                    "El valor nominal debe estar dentro del rango permitido."
            );
        }

        this.result = this.measuredValue.compareTo(this.lowerLimit) >= 0
                && this.measuredValue.compareTo(this.upperLimit) <= 0
                ? QualityCheckResult.PASS
                : QualityCheckResult.FAIL;
    }

    public void updatePassFail(
            String name,
            QualityCheckResult result,
            String notes
    ) {
        requireOpenInspection(qualityInspection);
        this.type = QualityCheckType.PASS_FAIL;
        this.name = requireText(name, "El nombre del control es obligatorio.");
        this.nominalValue = null;
        this.lowerLimit = null;
        this.upperLimit = null;
        this.measuredValue = null;
        this.unit = null;
        this.result = Objects.requireNonNull(
                result,
                "El resultado PASS/FAIL es obligatorio."
        );
        this.notes = normalizeOptional(notes);
    }

    private static void requireOpenInspection(QualityInspection inspection) {
        if (!inspection.isInProgress()) {
            throw new IllegalStateException(
                    "Los controles solo pueden registrarse durante una inspección IN_PROGRESS."
            );
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
