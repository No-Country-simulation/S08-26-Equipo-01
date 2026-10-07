package com.nocountry.qualitytrack.quality.service;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityDisposition;
import com.nocountry.qualitytrack.nonconformities.repository.NonConformityRepository;
import com.nocountry.qualitytrack.nonconformities.service.NonConformityReferenceGenerator;
import com.nocountry.qualitytrack.quality.dto.request.SaveQualityCheckRequest;
import com.nocountry.qualitytrack.quality.entity.QualityInspection;
import com.nocountry.qualitytrack.quality.entity.QualityCheck;
import com.nocountry.qualitytrack.quality.enums.QualityInspectionStatus;
import com.nocountry.qualitytrack.quality.enums.QualityCheckType;
import com.nocountry.qualitytrack.quality.enums.QualityCheckResult;
import com.nocountry.qualitytrack.quality.repository.QualityInspectionRepository;
import com.nocountry.qualitytrack.quality.repository.QualityCheckRepository;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import com.nocountry.qualitytrack.workorders.service.WorkOrderAccessPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QualityWorkflowServiceTest {

    @Mock private WorkOrderAccessPolicy accessPolicy;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private QualityInspectionRepository inspectionRepository;
    @Mock private QualityCheckRepository checkRepository;
    @Mock private NonConformityRepository nonConformityRepository;
    @Mock private NonConformityReferenceGenerator nonConformityReferenceGenerator;
    @Mock private TraceabilityService traceabilityService;
    @Mock private JobCase jobCase;
    @Mock private Quotation quotation;
    @Mock private User actor;

    private QualityWorkflowService service;
    private WorkOrder workOrder;

    @BeforeEach
    void setUp() {
        service = new QualityWorkflowService(
                accessPolicy,
                workOrderRepository,
                inspectionRepository,
                checkRepository,
                nonConformityRepository,
                nonConformityReferenceGenerator,
                traceabilityService
        );

        lenient().when(actor.getId()).thenReturn(10L);

        workOrder = WorkOrder.create(
                jobCase,
                quotation,
                "OT-00000001",
                WorkOrderPriority.NORMAL,
                20,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                actor
        );
        ReflectionTestUtils.setField(workOrder, "id", 7L);
        workOrder.releaseToProduction();
        workOrder.startProduction(Instant.parse("2026-09-27T08:00:00Z"));
        workOrder.markProductionCompleted(Instant.parse("2026-09-27T16:00:00Z"));
    }

    @Test
    void handoffCreatesPendingInspectionAndMovesOrderToQualityPending() {
        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(inspectionRepository.saveAndFlush(any(QualityInspection.class)))
                .thenAnswer(invocation -> {
                    QualityInspection inspection = invocation.getArgument(0);
                    ReflectionTestUtils.setField(inspection, "id", 100L);
                    return inspection;
                });
        when(checkRepository.findAllByQualityInspection_IdOrderByIdAsc(100L))
                .thenReturn(List.of());
        when(nonConformityRepository.findByQualityInspection_Id(100L))
                .thenReturn(Optional.empty());

        var response = service.handoff(10L, 7L);

        assertEquals(QualityInspectionStatus.PENDING, response.status());
        assertEquals(WorkOrderStatus.QUALITY_PENDING, workOrder.getStatus());
        assertEquals(100L, response.id());
        verify(traceabilityService, times(2)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void allPassingChecksApproveInspectionAndOrder() {
        QualityInspection inspection = startedInspection();
        QualityCheck measurement = qualityCheck(
                inspection,
                "25.020"
        );

        stubLockedInspection(inspection);
        when(accessPolicy.requireAssignedQualityActor(10L, 10L)).thenReturn(actor);
        when(checkRepository.findAllByQualityInspection_IdOrderByIdAsc(100L))
                .thenReturn(List.of(measurement));
        when(inspectionRepository.saveAndFlush(inspection)).thenReturn(inspection);

        var response = service.complete(10L, 100L);

        assertEquals(QualityInspectionStatus.APPROVED, response.status());
        assertEquals(WorkOrderStatus.READY_FOR_DELIVERY, workOrder.getStatus());
        assertNull(response.nonConformity());
        verify(traceabilityService, times(2)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
        verify(traceabilityService).record(
                any(),
                eq(TraceabilityAggregateType.WORK_ORDER),
                eq(7L),
                eq(TraceabilityEventType.WORK_ORDER_QUALITY_APPROVED),
                eq(WorkOrderStatus.QUALITY_PENDING.name()),
                eq(WorkOrderStatus.READY_FOR_DELIVERY.name()),
                eq(10L),
                any()
        );
    }

    @Test
    void failingCheckRejectsInspectionAndOpensNonConformity() {
        QualityInspection inspection = startedInspection();
        QualityCheck measurement = qualityCheck(
                inspection,
                "25.080"
        );

        stubLockedInspection(inspection);
        when(accessPolicy.requireAssignedQualityActor(10L, 10L)).thenReturn(actor);
        when(checkRepository.findAllByQualityInspection_IdOrderByIdAsc(100L))
                .thenReturn(List.of(measurement));
        when(nonConformityRepository.existsByQualityInspection_Id(100L)).thenReturn(false);
        when(nonConformityReferenceGenerator.nextNumber()).thenReturn("NC-0001");
        when(nonConformityRepository.saveAndFlush(any(NonConformity.class)))
                .thenAnswer(invocation -> {
                    NonConformity nonConformity = invocation.getArgument(0);
                    ReflectionTestUtils.setField(nonConformity, "id", 300L);
                    return nonConformity;
                });
        when(inspectionRepository.saveAndFlush(inspection)).thenReturn(inspection);

        var response = service.complete(10L, 100L);

        assertEquals(QualityInspectionStatus.REJECTED, response.status());
        assertEquals(WorkOrderStatus.QUALITY_HOLD, workOrder.getStatus());
        assertNotNull(response.nonConformity());
        assertEquals("NC-0001", response.nonConformity().number());
        assertEquals(NonConformityStatus.OPEN, response.nonConformity().status());
        verify(traceabilityService, times(3)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
        verify(traceabilityService).record(
                any(),
                eq(TraceabilityAggregateType.WORK_ORDER),
                eq(7L),
                eq(TraceabilityEventType.WORK_ORDER_QUALITY_REJECTED),
                eq(WorkOrderStatus.QUALITY_PENDING.name()),
                eq(WorkOrderStatus.QUALITY_HOLD.name()),
                eq(10L),
                any()
        );
    }

    @Test
    void failingPassFailCheckRejectsInspectionAndOpensNonConformity() {
        QualityInspection inspection = startedInspection();
        QualityCheck qualityCheck = QualityCheck.createPassFail(
                inspection,
                "Inspección visual de rebabas",
                QualityCheckResult.FAIL,
                "Se detectó rebaba visible en el extremo mecanizado."
        );
        ReflectionTestUtils.setField(qualityCheck, "id", 201L);

        stubLockedInspection(inspection);
        when(accessPolicy.requireAssignedQualityActor(10L, 10L)).thenReturn(actor);
        when(checkRepository.findAllByQualityInspection_IdOrderByIdAsc(100L))
                .thenReturn(List.of(qualityCheck));
        when(nonConformityRepository.existsByQualityInspection_Id(100L)).thenReturn(false);
        when(nonConformityReferenceGenerator.nextNumber()).thenReturn("NC-0002");
        when(nonConformityRepository.saveAndFlush(any(NonConformity.class)))
                .thenAnswer(invocation -> {
                    NonConformity nonConformity = invocation.getArgument(0);
                    ReflectionTestUtils.setField(nonConformity, "id", 301L);
                    return nonConformity;
                });
        when(inspectionRepository.saveAndFlush(inspection)).thenReturn(inspection);

        var response = service.complete(10L, 100L);

        assertEquals(QualityInspectionStatus.REJECTED, response.status());
        assertEquals(WorkOrderStatus.QUALITY_HOLD, workOrder.getStatus());
        assertNotNull(response.nonConformity());
        assertEquals("NC-0002", response.nonConformity().number());
    }

    @Test
    void updateCheckChecksQualityRoleBeforeLookingUpResources() {
        SaveQualityCheckRequest request = new SaveQualityCheckRequest(
                QualityCheckType.NUMERIC_RANGE,
                "Diámetro exterior",
                new BigDecimal("25.000"),
                new BigDecimal("24.950"),
                new BigDecimal("25.050"),
                new BigDecimal("25.020"),
                "mm",
                null,
                null
        );

        when(accessPolicy.requireQualityActor(99L))
                .thenThrow(new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "Acceso denegado."
                ));

        assertThrows(
                BusinessException.class,
                () -> service.updateCheck(
                        99L,
                        100L,
                        200L,
                        request
                )
        );

        verifyNoInteractions(
                checkRepository,
                inspectionRepository,
                workOrderRepository
        );
    }

    @Test
    void updatingNumericCheckTracesPreviousAndRecalculatedResult() {
        QualityInspection inspection = startedInspection();
        QualityCheck measurement = qualityCheck(inspection, "25.080");

        stubLockedInspection(inspection);
        when(accessPolicy.requireAssignedQualityActor(10L, 10L)).thenReturn(actor);
        when(checkRepository.findInspectionIdById(200L))
                .thenReturn(Optional.of(100L));
        when(checkRepository.findByIdForUpdate(200L))
                .thenReturn(Optional.of(measurement));
        when(checkRepository.saveAndFlush(measurement))
                .thenReturn(measurement);

        SaveQualityCheckRequest request = new SaveQualityCheckRequest(
                QualityCheckType.NUMERIC_RANGE,
                "Diámetro exterior",
                new BigDecimal("25.000"),
                new BigDecimal("24.950"),
                new BigDecimal("25.050"),
                new BigDecimal("25.020"),
                "mm",
                null,
                "Lectura corregida"
        );

        var response = service.updateCheck(
                10L,
                100L,
                200L,
                request
        );

        assertEquals(QualityCheckResult.PASS, response.result());
        verify(traceabilityService).record(
                any(),
                eq(TraceabilityAggregateType.QUALITY_CHECK),
                eq(200L),
                eq(TraceabilityEventType.QUALITY_CHECK_UPDATED),
                eq(QualityCheckResult.FAIL.name()),
                eq(QualityCheckResult.PASS.name()),
                eq(10L),
                any()
        );
    }

    @Test
    void approvedReinspectionClosesOriginalNonConformity() {
        NonConformity nonConformity = reworkNonConformity();
        QualityInspection reinspection = reinspection(nonConformity);
        QualityCheck measurement = QualityCheck.createNumericRange(
                reinspection,
                "Diámetro exterior",
                new BigDecimal("25.000"),
                new BigDecimal("24.950"),
                new BigDecimal("25.050"),
                new BigDecimal("25.020"),
                "mm",
                null
        );

        when(inspectionRepository.findWorkOrderIdById(101L))
                .thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L))
                .thenReturn(Optional.of(workOrder));
        when(inspectionRepository.findByIdForUpdate(101L))
                .thenReturn(Optional.of(reinspection));
        when(accessPolicy.requireAssignedQualityActor(10L, 10L))
                .thenReturn(actor);
        when(checkRepository.findAllByQualityInspection_IdOrderByIdAsc(101L))
                .thenReturn(List.of(measurement));
        when(nonConformityRepository.findByIdForUpdate(300L))
                .thenReturn(Optional.of(nonConformity));
        when(inspectionRepository.saveAndFlush(reinspection))
                .thenReturn(reinspection);
        when(nonConformityRepository.saveAndFlush(nonConformity))
                .thenReturn(nonConformity);

        var response = service.complete(10L, 101L);

        assertEquals(QualityInspectionStatus.APPROVED, response.status());
        assertEquals(WorkOrderStatus.READY_FOR_DELIVERY, workOrder.getStatus());
        assertEquals(NonConformityStatus.CLOSED, nonConformity.getStatus());
        assertEquals(NonConformityDisposition.REWORK, nonConformity.getDisposition());
        verify(traceabilityService).record(
                any(),
                eq(TraceabilityAggregateType.WORK_ORDER),
                eq(7L),
                eq(TraceabilityEventType.WORK_ORDER_NC_RESOLVED),
                eq(WorkOrderStatus.QUALITY_PENDING.name()),
                eq(WorkOrderStatus.READY_FOR_DELIVERY.name()),
                eq(10L),
                any()
        );
    }

    @Test
    void failedReinspectionKeepsSameNonConformityOpen() {
        NonConformity nonConformity = reworkNonConformity();
        QualityInspection reinspection = reinspection(nonConformity);
        QualityCheck measurement = QualityCheck.createNumericRange(
                reinspection,
                "Diámetro exterior",
                new BigDecimal("25.000"),
                new BigDecimal("24.950"),
                new BigDecimal("25.050"),
                new BigDecimal("25.090"),
                "mm",
                null
        );

        when(inspectionRepository.findWorkOrderIdById(101L))
                .thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L))
                .thenReturn(Optional.of(workOrder));
        when(inspectionRepository.findByIdForUpdate(101L))
                .thenReturn(Optional.of(reinspection));
        when(accessPolicy.requireAssignedQualityActor(10L, 10L))
                .thenReturn(actor);
        when(checkRepository.findAllByQualityInspection_IdOrderByIdAsc(101L))
                .thenReturn(List.of(measurement));
        when(nonConformityRepository.findByIdForUpdate(300L))
                .thenReturn(Optional.of(nonConformity));
        when(inspectionRepository.saveAndFlush(reinspection))
                .thenReturn(reinspection);
        when(nonConformityRepository.saveAndFlush(nonConformity))
                .thenReturn(nonConformity);

        var response = service.complete(10L, 101L);

        assertEquals(QualityInspectionStatus.REJECTED, response.status());
        assertEquals(WorkOrderStatus.QUALITY_HOLD, workOrder.getStatus());
        assertEquals(NonConformityStatus.OPEN, nonConformity.getStatus());
        assertEquals(300L, response.nonConformity().id());
    }

    private NonConformity reworkNonConformity() {
        QualityInspection originalInspection = startedInspection();
        originalInspection.reject(Instant.parse("2026-09-27T18:00:00Z"));
        workOrder.holdForQuality();

        NonConformity nonConformity = NonConformity.open(
                "NC-0001",
                workOrder,
                originalInspection,
                actor,
                Instant.parse("2026-09-27T18:00:00Z")
        );
        ReflectionTestUtils.setField(nonConformity, "id", 300L);
        nonConformity.updateDetails(
                1,
                "MAJOR",
                "Diámetro fuera de tolerancia."
        );
        nonConformity.selectRework();
        return nonConformity;
    }

    private QualityInspection reinspection(NonConformity nonConformity) {
        workOrder.startRework();
        QualityInspection inspection = QualityInspection.createReinspection(
                workOrder,
                nonConformity
        );
        ReflectionTestUtils.setField(inspection, "id", 101L);
        workOrder.sendReworkToQuality();
        inspection.start(actor, Instant.parse("2026-09-27T19:00:00Z"));
        return inspection;
    }

    private QualityInspection startedInspection() {
        QualityInspection inspection = QualityInspection.createPending(workOrder);
        ReflectionTestUtils.setField(inspection, "id", 100L);
        workOrder.sendToQuality();
        inspection.start(actor, Instant.parse("2026-09-27T17:00:00Z"));
        return inspection;
    }

    private QualityCheck qualityCheck(
            QualityInspection inspection,
            String measuredValue
    ) {
        QualityCheck measurement = QualityCheck.createNumericRange(
                inspection,
                "Diámetro exterior",
                new BigDecimal("25.000"),
                new BigDecimal("24.950"),
                new BigDecimal("25.050"),
                new BigDecimal(measuredValue),
                "mm",
                null
        );
        ReflectionTestUtils.setField(measurement, "id", 200L);
        return measurement;
    }

    private void stubLockedInspection(QualityInspection inspection) {
        when(inspectionRepository.findWorkOrderIdById(100L)).thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(inspectionRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(inspection));
    }
}
