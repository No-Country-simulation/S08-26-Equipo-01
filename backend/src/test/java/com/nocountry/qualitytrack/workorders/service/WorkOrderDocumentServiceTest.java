package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.entity.WorkOrderDocument;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderDocumentRepository;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkOrderDocumentServiceTest {

    @Mock private WorkOrderDocumentRepository linkRepository;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentVersionRepository versionRepository;
    @Mock private WorkOrderAccessPolicy accessPolicy;
    @Mock private TraceabilityService traceabilityService;
    @Mock private WorkOrder workOrder;
    @Mock private JobCase jobCase;
    @Mock private Document document;
    @Mock private DocumentVersion version;
    @Mock private DocumentVersion previousVersion;
    @Mock private User actor;

    private WorkOrderDocumentService service;

    @BeforeEach
    void setUp() {
        service = new WorkOrderDocumentService(
                linkRepository,
                workOrderRepository,
                documentRepository,
                versionRepository,
                accessPolicy,
                traceabilityService
        );
    }

    @Test
    void pinStoresExactDocumentVersionInsteadOfFollowingLatest() {
        stubCommonPinContext();

        when(linkRepository.findByWorkOrder_IdAndDocument_Id(7L, 20L))
                .thenReturn(Optional.empty());
        when(linkRepository.saveAndFlush(any(WorkOrderDocument.class)))
                .thenAnswer(invocation -> {
                    WorkOrderDocument link = invocation.getArgument(0);
                    ReflectionTestUtils.setField(link, "id", 50L);
                    return link;
                });

        var response = service.pin(10L, 7L, 20L, 31L);

        assertEquals(20L, response.documentId());
        assertEquals(31L, response.documentVersionId());
        assertEquals(3, response.version());
        assertEquals("plano-v3.pdf", response.fileName());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> metadataCaptor =
                ArgumentCaptor.forClass(Map.class);
        verify(traceabilityService).record(
                any(), any(), any(), any(), any(), any(), any(), metadataCaptor.capture()
        );
        assertEquals("PINNED", metadataCaptor.getValue().get("changeType"));
    }

    @Test
    void replacingPinnedVersionTracesPreviousAndNewVersion() {
        stubCommonPinContext();

        when(previousVersion.getDocument()).thenReturn(document);
        when(previousVersion.getId()).thenReturn(30L);
        when(previousVersion.getVersion()).thenReturn(2);

        WorkOrderDocument existing = WorkOrderDocument.pin(
                workOrder,
                document,
                previousVersion,
                actor,
                Instant.parse("2026-09-26T18:00:00Z")
        );
        ReflectionTestUtils.setField(existing, "id", 50L);

        when(linkRepository.findByWorkOrder_IdAndDocument_Id(7L, 20L))
                .thenReturn(Optional.of(existing));
        when(linkRepository.saveAndFlush(existing)).thenReturn(existing);

        var response = service.pin(10L, 7L, 20L, 31L);

        assertEquals(31L, response.documentVersionId());
        assertEquals(3, response.version());

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> metadataCaptor =
                ArgumentCaptor.forClass(Map.class);
        verify(traceabilityService).record(
                any(), any(), any(), any(), any(), any(), any(), metadataCaptor.capture()
        );

        Map<String, Object> metadata = metadataCaptor.getValue();
        assertEquals("REPLACED", metadata.get("changeType"));
        assertEquals(30L, metadata.get("previousDocumentVersionId"));
        assertEquals(2, metadata.get("previousVersion"));
        assertEquals(31L, metadata.get("documentVersionId"));
        assertEquals(3, metadata.get("version"));
    }

    private void stubCommonPinContext() {
        when(accessPolicy.requirePlanningActor(10L)).thenReturn(actor);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(workOrder.getStatus()).thenReturn(WorkOrderStatus.CREATED);
        when(workOrder.getJobCase()).thenReturn(jobCase);
        when(jobCase.getId()).thenReturn(3L);
        when(workOrder.getId()).thenReturn(7L);
        when(workOrder.getWorkOrderNumber()).thenReturn("OT-00000001");

        when(documentRepository.findByIdAndJobCase_IdAndStatus(
                20L,
                3L,
                DocumentStatus.ACTIVE
        )).thenReturn(Optional.of(document));
        when(versionRepository.findByIdAndDocument_IdAndDocument_JobCase_IdAndDocument_Status(
                31L,
                20L,
                3L,
                DocumentStatus.ACTIVE
        )).thenReturn(Optional.of(version));

        when(document.getId()).thenReturn(20L);
        when(document.getName()).thenReturn("Plano técnico");
        when(document.getDocumentType()).thenReturn("DRAWING");
        when(version.getDocument()).thenReturn(document);
        when(version.getId()).thenReturn(31L);
        when(version.getVersion()).thenReturn(3);
        when(version.getFileName()).thenReturn("plano-v3.pdf");
        when(actor.getId()).thenReturn(10L);
    }
}
