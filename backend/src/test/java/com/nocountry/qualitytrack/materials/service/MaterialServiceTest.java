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
        ReflectionTestUtils.setField(document, "id", 70L);

        DocumentVersion certificate = DocumentVersion.upload(
                document,
                1,
                "certificado.pdf",
                "materials/material-30/lot-40/v1-certificado.pdf",
                "application/pdf",
                100L,
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                actor
        );
        ReflectionTestUtils.setField(certificate, "id", 80L);

        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(materialLotRepository.findByIdForUpdate(40L)).thenReturn(Optional.of(lot));
        when(documentService.upsertMaterialCertificate(10L, lot, certificateFile))
                .thenReturn(certificate);
        when(materialLotRepository.saveAndFlush(lot)).thenReturn(lot);

        var response = service.attachCertificate(
                10L,
                30L,
                40L,
                certificateFile
        );

        assertEquals(70L, response.certificateDocumentId());
        assertEquals(80L, response.certificateDocumentVersionId());
        assertEquals("certificado.pdf", response.certificateFileName());
        verify(documentService).upsertMaterialCertificate(10L, lot, certificateFile);
    }

    @Test
    void repeatedConsumptionAggregatesSameWorkOrderAndLot() {
        WorkOrderMaterial existing = WorkOrderMaterial.create(
                workOrder,
                lot,
                new BigDecimal("10.500"),
                actor,
                Instant.parse("2026-09-28T09:00:00Z")
        );
        ReflectionTestUtils.setField(existing, "id", 50L);

        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(materialLotRepository.findByIdForUpdate(40L)).thenReturn(Optional.of(lot));
        when(workOrderMaterialRepository.sumQuantityUsedByMaterialLotId(40L))
                .thenReturn(new BigDecimal("10.500"));
        when(workOrderMaterialRepository.findByWorkOrderAndLotForUpdate(7L, 40L))
                .thenReturn(Optional.of(existing));
        when(workOrderMaterialRepository.saveAndFlush(existing)).thenReturn(existing);

        var response = service.recordConsumption(
                10L,
                7L,
                new RecordMaterialConsumptionRequest(
                        40L,
                        new BigDecimal("2.250")
                )
        );

        assertEquals(new BigDecimal("12.750"), response.quantityUsed());
        verify(traceabilityService).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void cannotConsumeMoreThanReceivedQuantity() {
        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(materialLotRepository.findByIdForUpdate(40L)).thenReturn(Optional.of(lot));
        when(workOrderMaterialRepository.sumQuantityUsedByMaterialLotId(40L))
                .thenReturn(new BigDecimal("95.000"));

        assertThrows(
                BusinessException.class,
                () -> service.recordConsumption(
                        10L,
                        7L,
                        new RecordMaterialConsumptionRequest(
                                40L,
                                new BigDecimal("6.000")
                        )
                )
        );
    }

    @Test
    void canRecordConsumptionAfterOperationsFinishBeforeQualityHandoff() {
        workOrder.markProductionCompleted(
                Instant.parse("2026-09-28T12:00:00Z")
        );

        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(workOrderRepository.findByIdForUpdate(7L))
                .thenReturn(Optional.of(workOrder));
        when(materialLotRepository.findByIdForUpdate(40L))
                .thenReturn(Optional.of(lot));
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
                        new BigDecimal("1.500")
                )
        );

        assertEquals(new BigDecimal("1.500"), response.quantityUsed());
    }

    @Test
    void consumptionRequiresWorkOrderInProduction() {
        WorkOrder ready = WorkOrder.create(
                jobCase,
                quotation,
                "OT-READY",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                actor
        );
        ReflectionTestUtils.setField(ready, "id", 8L);
        ready.releaseToProduction();

        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(workOrderRepository.findByIdForUpdate(8L)).thenReturn(Optional.of(ready));

        assertThrows(
                BusinessException.class,
                () -> service.recordConsumption(
                        10L,
                        8L,
                        new RecordMaterialConsumptionRequest(
                                40L,
                                new BigDecimal("1.000")
                        )
                )
        );
    }
}
