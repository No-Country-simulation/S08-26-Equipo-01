package com.nocountry.qualitytrack.routing.service;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.routing.dto.request.CreateRoutingOperationRequest;
import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.enums.RoutingSheetStatus;
import com.nocountry.qualitytrack.routing.repository.RoutingSheetRepository;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderDocumentRepository;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoutingServiceTest {

    @Mock private RoutingSheetRepository routingSheetRepository;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private WorkOrderDocumentRepository documentRepository;
    @Mock private RoutingAccessPolicy accessPolicy;
    @Mock private TraceabilityService traceabilityService;
    @Mock private WorkOrder workOrder;
    @Mock private JobCase jobCase;
    @Mock private User actor;

    private RoutingService service;

    @BeforeEach
    void setUp() {
        service = new RoutingService(
                routingSheetRepository,
                workOrderRepository,
                documentRepository,
                accessPolicy,
                traceabilityService
        );

        lenient().when(workOrder.getId()).thenReturn(7L);
        lenient().when(workOrder.getWorkOrderNumber()).thenReturn("OT-00126");
        lenient().when(workOrder.getStatus()).thenReturn(WorkOrderStatus.CREATED);
        lenient().when(workOrder.getJobCase()).thenReturn(jobCase);
        lenient().when(actor.getId()).thenReturn(10L);
    }

    @Test
    void createBuildsRevisionOneProductionDraft() {
        when(accessPolicy.requireDesignerActor(10L)).thenReturn(actor);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(documentRepository.existsByWorkOrder_Id(7L)).thenReturn(true);
        when(routingSheetRepository.existsByWorkOrder_IdAndPurpose(
                7L,
                RoutingPurpose.PRODUCTION
        )).thenReturn(false);
        when(routingSheetRepository.saveAndFlush(any(RoutingSheet.class)))
                .thenAnswer(invocation -> {
                    RoutingSheet routingSheet = invocation.getArgument(0);
                    ReflectionTestUtils.setField(routingSheet, "id", 20L);
                    return routingSheet;
                });

        var response = service.createProductionRouting(10L, 7L);

        assertEquals(20L, response.id());
        assertEquals(1, response.revision());
        assertEquals(RoutingPurpose.PRODUCTION, response.purpose());
        assertEquals(RoutingSheetStatus.DRAFT, response.status());
        assertEquals(0, response.operations().size());
        verify(traceabilityService).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void createRejectsWorkOrderWithoutPinnedDocuments() {
        when(accessPolicy.requireDesignerActor(10L)).thenReturn(actor);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(documentRepository.existsByWorkOrder_Id(7L)).thenReturn(false);

        assertThrows(
                BusinessException.class,
                () -> service.createProductionRouting(10L, 7L)
        );

        verify(routingSheetRepository, never()).saveAndFlush(any());
    }

    @Test
    void addOperationUpdatesDraftRouting() {
        RoutingSheet routingSheet = newRoutingSheet();
        when(accessPolicy.requireDesignerActor(10L)).thenReturn(actor);
        when(routingSheetRepository.findWorkOrderIdById(20L)).thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(routingSheetRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(routingSheet));
        when(routingSheetRepository.saveAndFlush(routingSheet)).thenReturn(routingSheet);

        var response = service.addOperation(
                10L,
                20L,
                new CreateRoutingOperationRequest(
                        50,
                        "drill",
                        "Taladrado",
                        "Taladrar según plano v3.",
                        45
                )
        );

        assertEquals(1, response.operations().size());
        assertEquals("DRILL", response.operations().get(0).code());
        assertEquals(45, response.totalEstimatedMinutes());
    }

    @Test
    void approvedRoutingCannotReceiveNewOperations() {
        RoutingSheet routingSheet = newRoutingSheet();
        routingSheet.addOperation(10, "CUT", "Corte", null, 30);
        routingSheet.approve(actor, java.time.Instant.now());

        when(accessPolicy.requireDesignerActor(10L)).thenReturn(actor);
        when(routingSheetRepository.findWorkOrderIdById(20L)).thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(routingSheetRepository.findByIdForUpdate(20L)).thenReturn(Optional.of(routingSheet));

        assertThrows(
                BusinessException.class,
                () -> service.addOperation(
                        10L,
                        20L,
                        new CreateRoutingOperationRequest(
                                20,
                                "TURN",
                                "Torneado",
                                null,
                                60
                        )
                )
        );
    }

    private RoutingSheet newRoutingSheet() {
        RoutingSheet routingSheet = RoutingSheet.createProduction(workOrder, actor);
        ReflectionTestUtils.setField(routingSheet, "id", 20L);
        return routingSheet;
    }
}
