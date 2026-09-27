package com.nocountry.qualitytrack.routing.entity;

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
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Locale;
import java.util.Objects;

@Entity
@Table(name = "routing_operations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoutingOperation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "routing_sheet_id", nullable = false)
    private RoutingSheet routingSheet;

    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber;

    @Column(nullable = false, length = 40)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "estimated_minutes", nullable = false)
    private Integer estimatedMinutes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    static RoutingOperation create(
            RoutingSheet routingSheet,
            Integer sequenceNumber,
            String code,
            String name,
            String instructions,
            Integer estimatedMinutes
    ) {
        RoutingOperation operation = new RoutingOperation();
        operation.routingSheet = Objects.requireNonNull(routingSheet);
        operation.apply(sequenceNumber, code, name, instructions, estimatedMinutes);
        return operation;
    }

    void update(
            Integer sequenceNumber,
            String code,
            String name,
            String instructions,
            Integer estimatedMinutes
    ) {
        apply(sequenceNumber, code, name, instructions, estimatedMinutes);
    }

    private void apply(
            Integer sequenceNumber,
            String code,
            String name,
            String instructions,
            Integer estimatedMinutes
    ) {
        this.sequenceNumber = requirePositive(
                sequenceNumber,
                "La secuencia de la operación debe ser mayor a cero."
        );
        this.code = requireText(code, 40, "El código de la operación es obligatorio.")
                .toUpperCase(Locale.ROOT);
        this.name = requireText(name, 150, "El nombre de la operación es obligatorio.");
        this.instructions = normalizeOptional(instructions);
        this.estimatedMinutes = requirePositive(
                estimatedMinutes,
                "El tiempo estimado debe ser mayor a cero."
        );
    }

    private static Integer requirePositive(Integer value, String message) {
        if (value == null || value <= 0) {
            throw new IllegalArgumentException(message);
        }
        return value;
    }

    private static String requireText(String value, int maxLength, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new IllegalArgumentException(message);
        }
        return normalized;
    }

    private static String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
