package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentContext;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.materials.entity.MaterialLot;
import com.nocountry.qualitytrack.materials.repository.MaterialLotRepository;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.entity.WorkOrderDocument;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderDocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentCenterServiceTest {

    @Mock private DocumentRepository documentRepository;
    @Mock private DocumentVersionRepository documentVersionRepository;
    @Mock private WorkOrderDocumentRepository workOrderDocumentRepository;
    @Mock private MaterialLotRepository materialLotRepository;
    @Mock private DeliveryRepository deliveryRepository;
    @Mock private DocumentAccessService accessService;

    @Mock private Document document;
    @Mock private DocumentVersion version;
    @Mock private DocumentVersion historicalVersion;
    @Mock private WorkOrderDocument workOrderDocument;
    @Mock private WorkOrder workOrder;
    @Mock private MaterialLot materialLot;
    @Mock private Delivery delivery;
    @Mock private JobCase jobCase;
    @Mock private CustomerRequest customerRequest;
    @Mock private Customer customer;
    @Mock private User creator;
    @Mock private User uploader;

    private DocumentCenterService service;

    @BeforeEach
    void setUp() {
        service = new DocumentCenterService(
                documentRepository,
                documentVersionRepository,
                workOrderDocumentRepository,
                materialLotRepository,
                deliveryRepository,
                accessService
        );
    }

    @Test
    void returnsExistingDocumentWithOperationalReferences() {
        stubDocument();

        when(documentRepository.searchActiveForCenter(
                DocumentStatus.ACTIVE,
                12L,
                40L,
                "DRAWING",
                null,
                null,
                null
        )).thenReturn(List.of(document));
        when(documentVersionRepository.findLatestByDocumentIds(List.of(7L)))
                .thenReturn(List.of(version));
        when(workOrderDocumentRepository.findAllByDocument_IdOrderByWorkOrder_IdAsc(7L))
                .thenReturn(List.of(workOrderDocument));
        when(materialLotRepository
                .findAllByCertificateDocumentVersion_Document_IdOrderByIdAsc(7L))
                .thenReturn(List.of());
        when(deliveryRepository
                .findAllByEvidenceDocumentVersion_Document_IdOrderByIdAsc(7L))
                .thenReturn(List.of(delivery));

        when(workOrderDocument.getWorkOrder()).thenReturn(workOrder);
        when(workOrder.getId()).thenReturn(70L);
        when(workOrderDocument.getDocumentVersion()).thenReturn(historicalVersion);
        when(historicalVersion.getId()).thenReturn(20L);
        when(historicalVersion.getVersion()).thenReturn(1);

        when(delivery.getId()).thenReturn(90L);
        when(delivery.getEvidenceDocumentVersion()).thenReturn(version);

        var response = service.search(
                10L,
                40L,
                12L,
                null,
                null,
                null,
                " drawing ",
                DocumentContext.WORK_ORDER
        );

        assertEquals(1, response.size());
        assertEquals(7L, response.get(0).id());
        assertEquals(21L, response.get(0).currentVersion().id());
        assertEquals(List.of(70L), response.get(0).workOrderIds());
        assertEquals(List.of(90L), response.get(0).deliveryIds());
        assertTrue(response.get(0).contexts().contains(DocumentContext.CASE));
        assertTrue(response.get(0).contexts().contains(DocumentContext.WORK_ORDER));
        assertTrue(response.get(0).contexts().contains(DocumentContext.DELIVERY));

        assertEquals(2, response.get(0).references().size());
        assertEquals(DocumentContext.WORK_ORDER, response.get(0).references().get(0).context());
        assertEquals(70L, response.get(0).references().get(0).resourceId());
        assertEquals(20L, response.get(0).references().get(0).documentVersionId());
        assertEquals(1, response.get(0).references().get(0).version());
        assertEquals(DocumentContext.DELIVERY, response.get(0).references().get(1).context());
        assertEquals(90L, response.get(0).references().get(1).resourceId());
        assertEquals(21L, response.get(0).references().get(1).documentVersionId());
        assertEquals(2, response.get(0).references().get(1).version());

        verify(accessService).requireInternalReader(10L);
    }

    @Test
    void filtersByDerivedDocumentContextWithoutDuplicatingRecords() {
        stubDocument();

        when(documentRepository.searchActiveForCenter(
                DocumentStatus.ACTIVE,
                null,
                null,
                null,
                null,
                null,
                null
        )).thenReturn(List.of(document));
        when(documentVersionRepository.findLatestByDocumentIds(List.of(7L)))
                .thenReturn(List.of(version));
        when(workOrderDocumentRepository.findAllByDocument_IdOrderByWorkOrder_IdAsc(7L))
                .thenReturn(List.of());
        when(materialLotRepository
                .findAllByCertificateDocumentVersion_Document_IdOrderByIdAsc(7L))
                .thenReturn(List.of());
        when(deliveryRepository
                .findAllByEvidenceDocumentVersion_Document_IdOrderByIdAsc(7L))
                .thenReturn(List.of());

        var response = service.search(
                10L,
                null,
                null,
                null,
                null,
                null,
                null,
                DocumentContext.MATERIAL
        );

        assertTrue(response.isEmpty());
        verify(accessService).requireInternalReader(10L);
    }

    private void stubDocument() {
        lenient().when(document.getId()).thenReturn(7L);
        lenient().when(document.getJobCase()).thenReturn(jobCase);
        lenient().when(document.getDocumentType()).thenReturn("DRAWING");
        lenient().when(document.getName()).thenReturn("Plano de eje");
        lenient().when(document.getDescription()).thenReturn("Plano vigente");
        lenient().when(document.getCreatedBy()).thenReturn(creator);
        lenient().when(document.getCreatedAt()).thenReturn(Instant.parse("2026-09-20T10:00:00Z"));

        lenient().when(jobCase.getId()).thenReturn(12L);
        lenient().when(jobCase.getCustomerRequest()).thenReturn(customerRequest);
        lenient().when(customerRequest.getId()).thenReturn(30L);
        lenient().when(customerRequest.getCustomer()).thenReturn(customer);
        lenient().when(customer.getId()).thenReturn(40L);

        lenient().when(creator.getId()).thenReturn(10L);
        lenient().when(creator.getFirstName()).thenReturn("Ana");
        lenient().when(creator.getLastName()).thenReturn("López");

        lenient().when(version.getId()).thenReturn(21L);
        lenient().when(version.getDocument()).thenReturn(document);
        lenient().when(version.getVersion()).thenReturn(2);
        lenient().when(version.getFileName()).thenReturn("plano-v2.pdf");
        lenient().when(version.getMimeType()).thenReturn("application/pdf");
        lenient().when(version.getFileSize()).thenReturn(100L);
        lenient().when(version.getChecksum()).thenReturn(
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        lenient().when(version.getUploadedBy()).thenReturn(uploader);
        lenient().when(version.getUploadedAt()).thenReturn(Instant.parse("2026-09-21T10:00:00Z"));
        lenient().when(uploader.getId()).thenReturn(11L);
        lenient().when(uploader.getFirstName()).thenReturn("Luis");
        lenient().when(uploader.getLastName()).thenReturn("Pérez");
    }
}
