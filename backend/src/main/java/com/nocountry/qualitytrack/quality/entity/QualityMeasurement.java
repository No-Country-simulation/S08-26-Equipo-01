package com.nocountry.qualitytrack.quality.entity;

import com.nocountry.qualitytrack.quality.enums.QualityMeasurementResult;
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
@Table(name = "quality_measurements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QualityMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quality_inspection_id", nullable = false)
    private QualityInspection qualityInspection;

    @Column(nullable = false, length = 200)
    private String characteristic;

    @Column(name = "nominal_value", nullable = false, precision = 18, scale = 6)
    private BigDecimal nominalValue;

    @Column(name = "lower_limit", nullable = false, precision = 18, scale = 6)
    private BigDecimal lowerLimit;

    @Column(name = "upper_limit", nullable = false, precision = 18, scale = 6)
    private BigDecimal upperLimit;

    @Column(name = "measured_value", nullable = false, precision = 18, scale = 6)
    private BigDecimal measuredValue;

    @Column(nullable = false, length = 20)
    private String unit;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QualityMeasurementResult result;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private QualityMeasurement(
            QualityInspection qualityInspection,
            String characteristic,
            BigDecimal nominalValue,
            BigDecimal lowerLimit,
            BigDecimal upperLimit,
            BigDecimal measuredValue,
            String unit,
            String notes
    ) {
        this.qualityInspection = Objects.requireNonNull(qualityInspection);
        updateValues(
                characteristic,
                nominalValue,
                lowerLimit,
                upperLimit,
                measuredValue,
                unit,
                notes
        );
    }

    public static QualityMeasurement create(
            QualityInspection qualityInspection,
            String characteristic,
            BigDecimal nominalValue,
            BigDecimal lowerLimit,
            BigDecimal upperLimit,
            BigDecimal measuredValue,
            String unit,
            String notes
    ) {
        if (!qualityInspection.isInProgress()) {
            throw new IllegalStateException(
                    "Las mediciones solo pueden registrarse durante una inspección IN_PROGRESS."
            );
        }
        return new QualityMeasurement(
                qualityInspection,
                characteristic,
                nominalValue,
                lowerLimit,
                upperLimit,
                measuredValue,
                unit,
                notes
        );
    }

    public void update(
            String characteristic,
            BigDecimal nominalValue,
            BigDecimal lowerLimit,
            BigDecimal upperLimit,
            BigDecimal measuredValue,
            String unit,
            String notes
    ) {
        if (!qualityInspection.isInProgress()) {
            throw new IllegalStateException(
                    "Una medición solo puede modificarse durante una inspección IN_PROGRESS."
            );
        }
        updateValues(
                characteristic,
                nominalValue,
                lowerLimit,
                upperLimit,
                measuredValue,
                unit,
                notes
        );
    }

    private void updateValues(
            String characteristic,
            BigDecimal nominalValue,
            BigDecimal lowerLimit,
            BigDecimal upperLimit,
            BigDecimal measuredValue,
            String unit,
            String notes
    ) {
        this.characteristic = requireText(
                characteristic,
                "La característica medida es obligatoria."
        );
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
                ? QualityMeasurementResult.PASS
                : QualityMeasurementResult.FAIL;
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
