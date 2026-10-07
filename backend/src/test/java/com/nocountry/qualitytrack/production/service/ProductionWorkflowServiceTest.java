package com.nocountry.qualitytrack.production.service;

import com.nocountry.qualitytrack.machines.entity.Machine;
import com.nocountry.qualitytrack.machines.repository.MachineRepository;
import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.production.dto.request.CompleteOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.request.StartOperationExecutionRequest;
import com.nocountry.qualitytrack.production.entity.OperationExecution;
import com.nocountry.qualitytrack.production.enums.OperationExecutionStatus;
import com.nocountry.qualitytrack.production.repository.OperationExecutionRepository;
import com.nocountry.qualitytrack.quality.entity.QualityInspection;
import com.nocountry.qualitytrack.quality.repository.QualityInspectionRepository;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.routing.entity.RoutingOperation;
import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.routing.repository.RoutingOperationRepository;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
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

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductionWorkflowServiceTest {

    @Mock private WorkOrderAccessPolicy accessPolicy;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private RoutingOperationRepository routingOperationRepository;
    @Mock private OperationExecutionRepository executionRepository;
    @Mock private MachineRepository machineRepository;
    @Mock private QualityInspectionRepository qualityInspectionRepository;
    @Mock private TraceabilityService traceabilityService;
    @Mock private JobCase jobCase;
    @Mock private Quotation quotation;
    @Mock private User actor;

    private ProductionWorkflowService service;
    private WorkOrder workOrder;
    private RoutingSheet routingSheet;
    private RoutingOperation firstOperation;
    private RoutingOperation secondOperation;

    @BeforeEach
    void setUp() {
        service = new ProductionWorkflowService(
                accessPolicy,
                workOrderRepository,
                routingOperationRepository,
                executionRepository,
                machineRepository,
                qualityInspectionRepository,
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

        routingSheet = RoutingSheet.createProduction(workOrder, actor);
        firstOperation = routingSheet.addOperation(
                10,
                "CUT",
                "Corte",
                "Preparar material.",
                30
        );
        secondOperation = routingSheet.addOperation(
                20,
                "TURN",
                "Torneado",
                "Mecanizar según plano.",
                120
        );

        ReflectionTestUtils.setField(routingSheet, "id", 20L);
        ReflectionTestUtils.setField(firstOperation, "id", 101L);
        ReflectionTestUtils.setField(secondOperation, "id", 102L);

        routingSheet.approve(actor, Instant.parse("2026-09-27T10:00:00Z"));
        routingSheet.release(actor, Instant.parse("2026-09-27T11:00:00Z"));
        workOrder.releaseToProduction();
    }

    @Test
    void firstExecutionStartsProduction() {
        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        stubLockedOperation(firstOperation);
        when(executionRepository.countByRoutingOperation_Id(101L)).thenReturn(0L);
        when(executionRepository.saveAndFlush(any(OperationExecution.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.start(
                10L,
                101L,
                new StartOperationExecutionRequest(null, null, "Inicio de corte.")
        );

        assertEquals(OperationExecutionStatus.IN_PROGRESS, response.status());
        assertEquals(WorkOrderStatus.IN_PRODUCTION, workOrder.getStatus());
        assertNotNull(workOrder.getActualStartAt());
        verify(traceabilityService, times(2)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void cannotSkipPreviousOperation() {
        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        stubLockedOperation(secondOperation);
        when(executionRepository.existsByRoutingOperation_IdAndStatus(
                102L,
                OperationExecutionStatus.IN_PROGRESS
        )).thenReturn(false);
        when(executionRepository.existsByRoutingOperation_IdAndStatus(
                102L,
                OperationExecutionStatus.COMPLETED
        )).thenReturn(false);
        when(executionRepository.existsByRoutingOperation_IdAndStatus(
                101L,
                OperationExecutionStatus.COMPLETED
        )).thenReturn(false);

        assertThrows(
                BusinessException.class,
                () -> service.start(
                        10L,
                        102L,
                        new StartOperationExecutionRequest(null, null, null)
                )
        );

        assertEquals(WorkOrderStatus.READY_FOR_PRODUCTION, workOrder.getStatus());
    }

    @Test
    void occupiedMachineCannotStartAnotherExecution() {
        Machine machine = Machine.create("CNC-01", "Torno CNC", "TURNING");
        ReflectionTestUtils.setField(machine, "id", 50L);
        machine.startUse();

        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        stubLockedOperation(firstOperation);
        when(machineRepository.findByIdForUpdate(50L)).thenReturn(Optional.of(machine));

        assertThrows(
                BusinessException.class,
                () -> service.start(
                        10L,
                        101L,
                        new StartOperationExecutionRequest(null, 50L, null)
                )
        );

        assertEquals(WorkOrderStatus.READY_FOR_PRODUCTION, workOrder.getStatus());
    }

    @Test
    void completingLastOperationMarksProductionCompleteWithoutSendingToQuality() {
        workOrder.startProduction(Instant.parse("2026-09-28T08:00:00Z"));

        OperationExecution execution = OperationExecution.start(
                firstOperation,
                actor,
                null,
                1,
                null,
                Instant.parse("2026-09-28T08:00:00Z")
        );
        ReflectionTestUtils.setField(execution, "id", 501L);

        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(executionRepository.findWorkOrderIdById(501L)).thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(executionRepository.findByIdForUpdate(501L)).thenReturn(Optional.of(execution));
        when(executionRepository.saveAndFlush(execution)).thenReturn(execution);
        when(routingOperationRepository.findAllByRoutingSheet_IdOrderBySequenceNumberAsc(20L))
                .thenReturn(List.of(firstOperation));
        when(executionRepository.existsByRoutingOperation_IdAndStatus(
                101L,
                OperationExecutionStatus.COMPLETED
        )).thenReturn(true);

        var response = service.complete(
                10L,
                501L,
                new CompleteOperationExecutionRequest(20, 19, 1, "Terminada.")
        );

        assertEquals(OperationExecutionStatus.COMPLETED, response.status());
        assertEquals(WorkOrderStatus.IN_PRODUCTION, workOrder.getStatus());
        assertEquals(true, workOrder.isProductionCompleted());
        assertNotNull(workOrder.getActualEndAt());
    }

    @Test
    void firstReworkExecutionMovesOrderToReworkInProgress() {
        NonConformity nonConformity = rejectedNonConformity();
        RoutingSheet reworkRouting = RoutingSheet.createRework(
                workOrder,
                2,
                nonConformity,
                actor
        );
        RoutingOperation reworkOperation = reworkRouting.addOperation(
                10,
                "RW-TURN",
                "Corrección de diámetro",
                "Retrabajar dimensión fuera de tolerancia.",
                45
        );
        ReflectionTestUtils.setField(reworkRouting, "id", 30L);
        ReflectionTestUtils.setField(reworkOperation, "id", 201L);
        reworkRouting.approve(actor, Instant.parse("2026-09-28T18:00:00Z"));
        reworkRouting.release(actor, Instant.parse("2026-09-28T18:10:00Z"));

        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(routingOperationRepository.findWorkOrderIdById(201L))
                .thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L))
                .thenReturn(Optional.of(workOrder));
        when(routingOperationRepository.findByIdForUpdate(201L))
                .thenReturn(Optional.of(reworkOperation));
        when(executionRepository.countByRoutingOperation_Id(201L)).thenReturn(0L);
        when(executionRepository.saveAndFlush(any(OperationExecution.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.start(
                10L,
                201L,
                new StartOperationExecutionRequest(null, null, "Inicio retrabajo.")
        );

        assertEquals(OperationExecutionStatus.IN_PROGRESS, response.status());
        assertEquals(WorkOrderStatus.REWORK_IN_PROGRESS, workOrder.getStatus());
        verify(traceabilityService, times(2)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void completingLastReworkOperationCreatesPendingReinspection() {
        NonConformity nonConformity = rejectedNonConformity();
        RoutingSheet reworkRouting = RoutingSheet.createRework(
                workOrder,
                2,
                nonConformity,
                actor
        );
        RoutingOperation reworkOperation = reworkRouting.addOperation(
                10,
                "RW-TURN",
                "Corrección de diámetro",
                "Retrabajar dimensión fuera de tolerancia.",
                45
        );
        ReflectionTestUtils.setField(reworkRouting, "id", 30L);
        ReflectionTestUtils.setField(reworkOperation, "id", 201L);
        reworkRouting.approve(actor, Instant.parse("2026-09-28T18:00:00Z"));
        reworkRouting.release(actor, Instant.parse("2026-09-28T18:10:00Z"));
        workOrder.startRework();

        OperationExecution execution = OperationExecution.start(
                reworkOperation,
                actor,
                null,
                1,
                null,
                Instant.parse("2026-09-28T18:15:00Z")
        );
        ReflectionTestUtils.setField(execution, "id", 601L);

        when(accessPolicy.requireProductionActor(10L)).thenReturn(actor);
        when(executionRepository.findWorkOrderIdById(601L))
                .thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L))
                .thenReturn(Optional.of(workOrder));
        when(executionRepository.findByIdForUpdate(601L))
                .thenReturn(Optional.of(execution));
        when(executionRepository.saveAndFlush(execution)).thenReturn(execution);
        when(routingOperationRepository.findAllByRoutingSheet_IdOrderBySequenceNumberAsc(30L))
                .thenReturn(List.of(reworkOperation));
        when(executionRepository.existsByRoutingOperation_IdAndStatus(
                201L,
                OperationExecutionStatus.COMPLETED
        )).thenReturn(true);
        when(qualityInspectionRepository.saveAndFlush(any(QualityInspection.class)))
                .thenAnswer(invocation -> {
                    QualityInspection inspection = invocation.getArgument(0);
                    ReflectionTestUtils.setField(inspection, "id", 700L);
                    return inspection;
                });

        var response = service.complete(
                10L,
                601L,
                new CompleteOperationExecutionRequest(1, 1, 0, "Retrabajo terminado.")
        );

        assertEquals(OperationExecutionStatus.COMPLETED, response.status());
        assertEquals(WorkOrderStatus.QUALITY_PENDING, workOrder.getStatus());
        verify(qualityInspectionRepository).saveAndFlush(any(QualityInspection.class));
        verify(traceabilityService, times(3)).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    private NonConformity rejectedNonConformity() {
        workOrder.startProduction(Instant.parse("2026-09-28T08:00:00Z"));
        workOrder.markProductionCompleted(Instant.parse("2026-09-28T16:00:00Z"));

        QualityInspection inspection = QualityInspection.createPending(workOrder);
        ReflectionTestUtils.setField(inspection, "id", 300L);
        workOrder.sendToQuality();
        inspection.start(actor, Instant.parse("2026-09-28T17:00:00Z"));
        inspection.reject(Instant.parse("2026-09-28T17:30:00Z"));
        workOrder.holdForQuality();

        NonConformity nonConformity = NonConformity.open(
                "NC-0001",
                workOrder,
                inspection,
                actor,
                Instant.parse("2026-09-28T17:30:00Z")
        );
        ReflectionTestUtils.setField(nonConformity, "id", 400L);
        nonConformity.updateDetails(
                1,
                "MAJOR",
                "Diámetro fuera de tolerancia."
        );
        nonConformity.selectRework();
        return nonConformity;
    }

    private void stubLockedOperation(RoutingOperation operation) {
        when(routingOperationRepository.findWorkOrderIdById(operation.getId()))
                .thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L))
                .thenReturn(Optional.of(workOrder));
        when(routingOperationRepository.findByIdForUpdate(operation.getId()))
                .thenReturn(Optional.of(operation));
    }
}
