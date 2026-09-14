package com.nocountry.qualitytrack.traceability.repository;

import com.nocountry.qualitytrack.traceability.entity.TraceabilityEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TraceabilityEventRepository extends JpaRepository<TraceabilityEvent, Long> {

    List<TraceabilityEvent> findAllByJobCase_IdOrderByOccurredAtAscIdAsc(Long caseId);
}
