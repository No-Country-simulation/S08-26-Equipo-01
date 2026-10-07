package com.nocountry.qualitytrack.materials.service;

import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.materials.dto.request.CreateMaterialLotRequest;
import com.nocountry.qualitytrack.materials.dto.request.RecordMaterialConsumptionRequest;
import com.nocountry.qualitytrack.materials.entity.Material;
import com.nocountry.qualitytrack.materials.entity.MaterialLot;
import com.nocountry.qualitytrack.materials.entity.WorkOrderMaterial;
import com.nocountry.qualitytrack.materials.repository.MaterialLotRepository;
import com.nocountry.qualitytrack.materials.repository.MaterialRepository;
import com.nocountry.qualitytrack.materials.repository.WorkOrderMaterialRepository;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import com.nocountry.qualitytrack.workorders.service.WorkOrderAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MaterialServiceTest {

    @Mock private MaterialRepository materialRepository;
    @Mock private MaterialLotRepository materialLotRepository;
    @Mock private WorkOrderMaterialRepository workOrderMaterialRepository;
    @Mock private DocumentService documentService;
    @Mock private MaterialReferenceDocumentService materialReferenceDocumentService;
    @Mock private MultipartFile certificateFile;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private WorkOrderAccessPolicy accessPolicy;
    @Mock private TraceabilityService traceabilityService;
    @Mock private JobCase jobCase;
    @Mock private Quotation quotation;
    @Mock private User actor;

    private MaterialService service;
    private WorkOrder workOrder;
    private Material material;
    private MaterialLot lot;

    @BeforeEach
    void setUp() {
        service = new MaterialService(
                materialRepository,
                materialLotRepository,
                workOrderMaterialRepository,
                documentService,
                materialReferenceDocumentService,
                workOrderRepository,
                accessPolicy,
                traceabilityService
        );

        lenient().when(actor.getId()).thenReturn(10L);

        workOrder = WorkOrder.create(
                jobCase,
                quotation,
                "OT-00126",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                actor
        );
        ReflectionTestUtils.setField(workOrder, "id", 7L);
        workOrder.releaseToProduction();
        workOrder.startProduction(Instant.parse("2026-09-28T08:00:00Z"));

        material = Material.create(
                "AISI-304",
                "Acero inoxidable",
                "ASTM A240",
                "KG"
        );
        ReflectionTestUtils.setField(material, "id", 30L);

        lot = MaterialLot.create(
                material,
                "LOT-001",
                "Proveedor",
                Instant.parse("2026-09-20T08:00:00Z"),
                new BigDecimal("100.000"),
                null
        );
        ReflectionTestUtils.setField(lot, "id", 40L);
    }

    @Test
    void attachesCertificateOwnedByMaterialLot() {
        Document document = Document.createForMaterialLot(
                lot,
                "MATERIAL_CERTIFICATE",
                "Certificado LOT-001",
                null,
                actor
        );
        ReflectionTestUtils.setField(document, "id", 101L);

        DocumentVersion version = DocumentVersion.upload(
                document,
                1,
                "certificado.pdf",
                "storage-key",
                "application/pdf",
                100L,
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                actor
        );
        ReflectionTestUtils.setField(version, "id", 201L);

        when(materialLotRepository.findByIdForUpdate(40L)).thenReturn(Optional.of(lot));
        when(documentService.upsertMaterialCertificate(10L, lot, certificateFile))
                .thenReturn(version);
        when(materialLotRepository.saveAndFlush(lot)).thenReturn(lot);

        var response = service.attachCertificate(10L, 30L, 40L, certificateFile);

        assertEquals(201L, response.certificateDocumentVersionId());
        verify(documentService).upsertMaterialCertificate(10L, lot, certificateFile);
        verify(materialLotRepository).saveAndFlush(lot);
    }

    @Test
    void rejectsCertificateWhenLotDoesNotBelongToMaterial() {
        when(materialLotRepository.findByIdForUpdate(40L)).thenReturn(Optional.of(lot));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.attachCertificate(10L, 999L, 40L, certificateFile)
        );

        assertEquals("No se encontró el lote para el material indicado.", exception.getMessage());
        verifyNoInteractions(documentService);
    }

    @Test
    void rejectsDuplicateLotNumberForSameMaterial() {
        when(materialRepository.findById(30L)).thenReturn(Optional.of(material));
        when(materialLotRepository.existsByMaterial_IdAndLotNumberIgnoreCase(30L, "LOT-001"))
                .thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.createLot(
                        10L,
                        30L,
                        new CreateMaterialLotRequest(
                                "LOT-001",
                                "Proveedor",
                                Instant.parse("2026-09-20T08:00:00Z"),
                                new BigDecimal("100.000")
                        )
                )
        );

        assertEquals("Ya existe ese número de lote para el material.", exception.getMessage());
    }

    @Test
    void recordsMaterialConsumption() {
        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(materialLotRepository.findByIdForUpdate(40L)).thenReturn(Optional.of(lot));
        when(workOrderMaterialRepository.sumQuantityUsedByMaterialLotId(40L))
                .thenReturn(BigDecimal.ZERO);
        when(workOrderMaterialRepository.findByWorkOrderAndLotForUpdate(7L, 40L))
                .thenReturn(Optional.empty());
        when(workOrderMaterialRepository.saveAndFlush(any(WorkOrderMaterial.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.recordConsumption(
                10L,
                7L,
                new RecordMaterialConsumptionRequest(
                        40L,
                        new BigDecimal("10.500")
                )
        );

        assertEquals(0, response.quantityUsed().compareTo(new BigDecimal("10.500")));
        verify(traceabilityService).record(
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any(),
                any()
        );
    }
}
