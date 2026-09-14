package com.nocountry.qualitytrack.traceability.service;

import com.nocountry.qualitytrack.requests.entity.JobCase;
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

import java.time.Instant;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
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
    void returnsTimelineInRepositoryOrder() {
        TraceabilityEvent event = TraceabilityEvent.record(
                jobCase,
                TraceabilityAggregateType.DOCUMENT,
                7L,
                TraceabilityEventType.DOCUMENT_ADDED,
                null,
                null,
                actor,
                Map.of("documentName", "plano.pdf"),
                Instant.parse("2026-09-13T10:00:00Z")
        );

        when(actor.getId()).thenReturn(10L);
        when(actor.getFirstName()).thenReturn("Ana");
        when(actor.getLastName()).thenReturn("López");
        when(traceabilityEventRepository.findAllByJobCase_IdOrderByOccurredAtAscIdAsc(12L))
                .thenReturn(List.of(event));

        var response = service.timeline(12L);

        assertEquals(1, response.size());
        assertEquals(TraceabilityEventType.DOCUMENT_ADDED, response.get(0).eventType());
        assertEquals("Ana López", response.get(0).performedByName());
        assertEquals("plano.pdf", response.get(0).metadata().get("documentName"));
    }
}
