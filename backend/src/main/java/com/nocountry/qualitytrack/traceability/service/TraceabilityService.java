package com.nocountry.qualitytrack.traceability.service;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityEventResponse;
import com.nocountry.qualitytrack.traceability.entity.TraceabilityEvent;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.repository.TraceabilityEventRepository;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TraceabilityService {

    private final TraceabilityEventRepository traceabilityEventRepository;
    private final UserRepository userRepository;

    @Transactional(propagation = Propagation.MANDATORY)
    public void record(
            JobCase jobCase,
            TraceabilityAggregateType aggregateType,
            Long aggregateId,
            TraceabilityEventType eventType,
            String fromStatus,
            String toStatus,
            Long performedByUserId,
            Map<String, Object> metadata
    ) {
        User actor = performedByUserId == null
                ? null
                : userRepository.getReferenceById(performedByUserId);

        TraceabilityEvent event = TraceabilityEvent.record(
                jobCase,
                aggregateType,
                aggregateId,
                eventType,
                fromStatus,
                toStatus,
                actor,
                metadata,
                Instant.now()
        );

        traceabilityEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<TraceabilityEventResponse> timeline(Long caseId) {
        return traceabilityEventRepository
                .findAllByJobCase_IdOrderByOccurredAtAscIdAsc(caseId)
                .stream()
                .map(TraceabilityEventResponse::from)
                .toList();
    }
}
