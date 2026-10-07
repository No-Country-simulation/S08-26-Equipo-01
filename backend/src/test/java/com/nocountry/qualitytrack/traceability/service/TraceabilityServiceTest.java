package com.nocountry.qualitytrack.traceability.service;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.entity.TraceabilityEvent;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.repository.TraceabilityEventRepository;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TraceabilityServiceTest {

    @Mock
    private TraceabilityEventRepository traceabilityEventRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobCase jobCase;

    @Mock
    private User actor;

    @Mock
    private TraceabilityEvent newestEvent;

    @Mock
    private TraceabilityEvent olderEvent;

    private TraceabilityService service;

    @BeforeEach
    void setUp() {
        service = new TraceabilityService(traceabilityEventRepository, userRepository);
    }

    @Test
    void recordsEventWithActorAndMetadata() {
        when(userRepository.getReferenceById(10L)).thenReturn(actor);

        service.record(
                jobCase,
                TraceabilityAggregateType.JOB_CASE,
                12L,
                TraceabilityEventType.JOB_CASE_CREATED,
                null,
                "SUBMITTED",
                10L,
                Map.of("caseNumber", "CASE-00000001")
        );

        ArgumentCaptor<TraceabilityEvent> captor = ArgumentCaptor.forClass(TraceabilityEvent.class);
        verify(traceabilityEventRepository).save(captor.capture());

        TraceabilityEvent event = captor.getValue();
        assertSame(jobCase, event.getJobCase());
        assertEquals(TraceabilityAggregateType.JOB_CASE, event.getAggregateType());
        assertEquals(12L, event.getAggregateId());
        assertEquals(TraceabilityEventType.JOB_CASE_CREATED, event.getEventType());
        assertEquals("SUBMITTED", event.getToStatus());
        assertSame(actor, event.getPerformedByUser());
        assertEquals("CASE-00000001", event.getMetadata().get("caseNumber"));
        assertTrue(event.getOccurredAt().isBefore(Instant.now().plusSeconds(1)));
    }

    @Test
    void returnsNewestTimelinePageWithOpaqueCursor() {
        Instant newestAt = Instant.parse("2026-10-01T18:00:00Z");
        stubEvent(newestEvent, 20L, newestAt, TraceabilityEventType.JOB_CASE_REVIEW_STARTED);

        when(traceabilityEventRepository
                .findByJobCase_IdOrderByOccurredAtDescIdDesc(
                        12L,
                        PageRequest.of(0, 2)
                ))
                .thenReturn(List.of(newestEvent, olderEvent));

        var response = service.timeline(12L, 1, null);

        assertEquals(1, response.items().size());
        assertEquals(20L, response.items().get(0).id());
        assertTrue(response.hasMore());
        assertNotNull(response.nextCursor());
    }

    @Test
    void continuesTimelineFromCursorWithoutOffsetPagination() {
        Instant newestAt = Instant.parse("2026-10-01T18:00:00Z");
        Instant olderAt = Instant.parse("2026-10-01T17:00:00Z");
        stubEvent(newestEvent, 20L, newestAt, TraceabilityEventType.JOB_CASE_REVIEW_STARTED);
        stubEvent(olderEvent, 19L, olderAt, TraceabilityEventType.JOB_CASE_CREATED);

        when(traceabilityEventRepository
                .findByJobCase_IdOrderByOccurredAtDescIdDesc(
                        12L,
                        PageRequest.of(0, 2)
                ))
                .thenReturn(List.of(newestEvent, olderEvent));

        String cursor = service.timeline(12L, 1, null).nextCursor();

        when(traceabilityEventRepository.findTimelineBefore(
                12L,
                newestAt,
                20L,
                PageRequest.of(0, 2)
        )).thenReturn(List.of(olderEvent));

        var response = service.timeline(12L, 1, cursor);

        assertEquals(1, response.items().size());
        assertEquals(19L, response.items().get(0).id());
        assertFalse(response.hasMore());
        assertEquals(null, response.nextCursor());
    }

    @Test
    void rejectsInvalidTimelineLimit() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.timeline(12L, 0, null)
        );

        assertEquals(ApiErrorCode.VALIDATION_ERROR, exception.getCode());
    }

    @Test
    void rejectsMalformedTimelineCursor() {
        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.timeline(12L, 20, "not-a-valid-cursor")
        );

        assertEquals(ApiErrorCode.MALFORMED_REQUEST, exception.getCode());
    }

    private void stubEvent(
            TraceabilityEvent event,
            Long id,
            Instant occurredAt,
            TraceabilityEventType eventType
    ) {
        when(event.getId()).thenReturn(id);
        when(event.getAggregateType()).thenReturn(TraceabilityAggregateType.JOB_CASE);
        when(event.getAggregateId()).thenReturn(12L);
        when(event.getEventType()).thenReturn(eventType);
        when(event.getMetadata()).thenReturn(Map.of());
        when(event.getOccurredAt()).thenReturn(occurredAt);
    }
}
