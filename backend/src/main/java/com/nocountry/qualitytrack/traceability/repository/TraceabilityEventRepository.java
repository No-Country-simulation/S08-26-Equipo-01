package com.nocountry.qualitytrack.traceability.repository;

import com.nocountry.qualitytrack.traceability.entity.TraceabilityEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface TraceabilityEventRepository extends JpaRepository<TraceabilityEvent, Long> {

    @EntityGraph(attributePaths = {"jobCase", "performedByUser"})
    List<TraceabilityEvent> findTop8ByOrderByOccurredAtDescIdDesc();

    @EntityGraph(attributePaths = {"performedByUser"})
    List<TraceabilityEvent> findByJobCase_IdOrderByOccurredAtDescIdDesc(
            Long caseId,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {"performedByUser"})
    List<TraceabilityEvent> findAllByJobCase_IdOrderByOccurredAtDescIdDesc(
            Long caseId
    );


    @EntityGraph(attributePaths = {"performedByUser"})
    @Query("""
            select event
            from TraceabilityEvent event
            where event.jobCase.id = :caseId
              and (
                    event.occurredAt < :occurredAt
                    or (event.occurredAt = :occurredAt and event.id < :eventId)
                  )
            order by event.occurredAt desc, event.id desc
            """)
    List<TraceabilityEvent> findTimelineBefore(
            @Param("caseId") Long caseId,
            @Param("occurredAt") Instant occurredAt,
            @Param("eventId") Long eventId,
            Pageable pageable
    );
}
