package com.nocountry.qualitytrack.traceability.entity;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

@Entity
@Table(name = "traceability_events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TraceabilityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false)
    private JobCase jobCase;

    @Enumerated(EnumType.STRING)
    @Column(name = "aggregate_type", nullable = false, length = 60)
    private TraceabilityAggregateType aggregateType;

    @Column(name = "aggregate_id", nullable = false)
    private Long aggregateId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 100)
    private TraceabilityEventType eventType;

    @Column(name = "from_status", length = 60)
    private String fromStatus;

    @Column(name = "to_status", length = 60)
    private String toStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_user_id")
    private User performedByUser;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private Instant occurredAt;

    private TraceabilityEvent(
            JobCase jobCase,
            TraceabilityAggregateType aggregateType,
            Long aggregateId,
            TraceabilityEventType eventType,
            String fromStatus,
            String toStatus,
            User performedByUser,
            Map<String, Object> metadata,
            Instant occurredAt
    ) {
        this.jobCase = Objects.requireNonNull(jobCase);
        this.aggregateType = Objects.requireNonNull(aggregateType);
        this.aggregateId = Objects.requireNonNull(aggregateId);
        this.eventType = Objects.requireNonNull(eventType);
        this.fromStatus = normalizeNullable(fromStatus);
        this.toStatus = normalizeNullable(toStatus);
        this.performedByUser = performedByUser;
        this.metadata = copyMetadata(metadata);
        this.occurredAt = Objects.requireNonNull(occurredAt);
    }

    public static TraceabilityEvent record(
            JobCase jobCase,
            TraceabilityAggregateType aggregateType,
            Long aggregateId,
            TraceabilityEventType eventType,
            String fromStatus,
            String toStatus,
            User performedByUser,
            Map<String, Object> metadata,
            Instant occurredAt
    ) {
        return new TraceabilityEvent(
                jobCase,
                aggregateType,
                aggregateId,
                eventType,
                fromStatus,
                toStatus,
                performedByUser,
                metadata,
                occurredAt
        );
    }

    private static Map<String, Object> copyMetadata(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return new LinkedHashMap<>();
        }

        Map<String, Object> copy = new LinkedHashMap<>();
        metadata.forEach((key, value) -> {
            if (key != null && !key.isBlank() && value != null) {
                copy.put(key, value);
            }
        });
        return copy;
    }

    private static String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
