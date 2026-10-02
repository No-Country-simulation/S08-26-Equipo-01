package com.nocountry.qualitytrack.traceability.service;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityEventResponse;
import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityTimelinePageResponse;
import com.nocountry.qualitytrack.traceability.entity.TraceabilityEvent;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.repository.TraceabilityEventRepository;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TraceabilityService {

    private static final int MAX_TIMELINE_LIMIT = 50;

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
    public List<TraceabilityEventResponse> timelineAll(Long caseId) {
        return traceabilityEventRepository
                .findAllByJobCase_IdOrderByOccurredAtDescIdDesc(caseId)
                .stream()
                .map(TraceabilityEventResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public TraceabilityTimelinePageResponse timeline(
            Long caseId,
            int limit,
            String cursor
    ) {
        validateTimelineLimit(limit);

        TimelineCursor decodedCursor = decodeCursor(cursor);
        PageRequest pageRequest = PageRequest.of(0, limit + 1);

        List<TraceabilityEvent> events = decodedCursor == null
                ? traceabilityEventRepository
                        .findByJobCase_IdOrderByOccurredAtDescIdDesc(caseId, pageRequest)
                : traceabilityEventRepository.findTimelineBefore(
                        caseId,
                        decodedCursor.occurredAt(),
                        decodedCursor.eventId(),
                        pageRequest
                );

        boolean hasMore = events.size() > limit;
        List<TraceabilityEvent> visibleEvents = events.subList(
                0,
                Math.min(events.size(), limit)
        );

        List<TraceabilityEventResponse> items = visibleEvents.stream()
                .map(TraceabilityEventResponse::from)
                .toList();

        String nextCursor = hasMore && !visibleEvents.isEmpty()
                ? encodeCursor(visibleEvents.get(visibleEvents.size() - 1))
                : null;

        return new TraceabilityTimelinePageResponse(items, nextCursor, hasMore);
    }

    private void validateTimelineLimit(int limit) {
        if (limit < 1 || limit > MAX_TIMELINE_LIMIT) {
            throw new BusinessException(
                    ApiErrorCode.VALIDATION_ERROR,
                    "El límite del historial debe estar entre 1 y 50."
            );
        }
    }

    private String encodeCursor(TraceabilityEvent event) {
        String value = event.getOccurredAt() + "|" + event.getId();

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private TimelineCursor decodeCursor(String cursor) {
        if (cursor == null || cursor.isBlank()) {
            return null;
        }

        try {
            String decoded = new String(
                    Base64.getUrlDecoder().decode(cursor),
                    StandardCharsets.UTF_8
            );
            String[] parts = decoded.split("\\|", 2);

            if (parts.length != 2) {
                throw invalidCursor();
            }

            Instant occurredAt = Instant.parse(parts[0]);
            Long eventId = Long.valueOf(parts[1]);

            if (eventId <= 0) {
                throw invalidCursor();
            }

            return new TimelineCursor(occurredAt, eventId);
        } catch (IllegalArgumentException | DateTimeParseException exception) {
            throw invalidCursor();
        }
    }

    private BusinessException invalidCursor() {
        return new BusinessException(
                ApiErrorCode.MALFORMED_REQUEST,
                "El cursor del historial no es válido."
        );
    }

    private record TimelineCursor(Instant occurredAt, Long eventId) {
    }
}
