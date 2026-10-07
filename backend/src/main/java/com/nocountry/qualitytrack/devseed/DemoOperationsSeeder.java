package com.nocountry.qualitytrack.devseed;

import com.nocountry.qualitytrack.deliveries.dto.request.CompleteDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.CreateDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.DispatchDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.response.DeliveryResponse;
import com.nocountry.qualitytrack.deliveries.service.DeliveryService;
import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.production.dto.request.CompleteOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.request.StartOperationExecutionRequest;
import com.nocountry.qualitytrack.production.dto.response.OperationExecutionResponse;
import com.nocountry.qualitytrack.production.service.ProductionWorkflowService;
import com.nocountry.qualitytrack.quality.dto.request.SaveQualityCheckRequest;
import com.nocountry.qualitytrack.quality.dto.request.StartQualityInspectionRequest;
import com.nocountry.qualitytrack.quality.dto.response.QualityInspectionResponse;
import com.nocountry.qualitytrack.quality.enums.QualityCheckResult;
import com.nocountry.qualitytrack.quality.enums.QualityCheckType;
import com.nocountry.qualitytrack.quality.service.QualityWorkflowService;
import com.nocountry.qualitytrack.routing.dto.request.CreateRoutingOperationRequest;
import com.nocountry.qualitytrack.routing.dto.response.RoutingOperationResponse;
import com.nocountry.qualitytrack.routing.dto.response.RoutingSheetResponse;
import com.nocountry.qualitytrack.routing.service.RoutingService;
import com.nocountry.qualitytrack.routing.service.RoutingWorkflowService;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.service.WorkOrderDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;

@Component
@Profile("seed-demo")
@RequiredArgsConstructor
public class DemoOperationsSeeder {

    private final DemoCommercialSeeder commercialSeeder;
    private final DocumentService documentService;
    private final WorkOrderDocumentService workOrderDocumentService;
    private final RoutingService routingService;
    private final RoutingWorkflowService routingWorkflowService;
    private final ProductionWorkflowService productionWorkflowService;
    private final QualityWorkflowService qualityWorkflowService;
    private final DeliveryService deliveryService;

    void seedWorkOrderScenarios(
            DemoInternalActors actors,
            DemoCustomer motores,
            DemoCustomer atlas
    ) {
        commercialSeeder.createApprovedWorkOrder(
                actors,
                motores,
                "MN-2026-003",
                "Componente de acoplamiento",
                14,
                "Acero AISI 4140",
                WorkOrderPriority.NORMAL,
                "1780.00"
        );

        DemoWorkOrder readyForProduction =
                commercialSeeder.createApprovedWorkOrder(
                        actors,
                        motores,
                        "MN-2026-004",
                        "Placa base industrial",
                        6,
                        "Acero ASTM A36",
                        WorkOrderPriority.HIGH,
                        "5600.00"
                );
        prepareAndReleaseRouting(actors, readyForProduction);

        DemoWorkOrder inProduction =
                commercialSeeder.createApprovedWorkOrder(
                        actors,
                        atlas,
                        "GA-2026-001",
                        "Cuerpo de válvula",
                        20,
                        "Acero inoxidable AISI 316",
                        WorkOrderPriority.URGENT,
                        "3250.00"
                );
        RoutingSheetResponse inProductionRouting =
                prepareAndReleaseRouting(actors, inProduction);

        RoutingOperationResponse firstOperation =
                inProductionRouting.operations().get(0);

        productionWorkflowService.start(
                actors.production().getId(),
                firstOperation.id(),
                new StartOperationExecutionRequest(
                        null,
                        null,
                        "Inicio de producción del escenario demo."
                )
        );
    }

    void seedQualityAndDeliveryScenarios(
            DemoInternalActors actors,
            DemoCustomer atlas,
            DemoCustomer hidraulica
    ) {
        DemoWorkOrder qualityPending =
                commercialSeeder.createApprovedWorkOrder(
                        actors,
                        atlas,
                        "GA-2026-002",
                        "Brida de sellado",
                        30,
                        "Acero inoxidable AISI 304",
                        WorkOrderPriority.HIGH,
                        "980.00"
                );
        completeProduction(actors, qualityPending);
        qualityWorkflowService.handoff(
                actors.production().getId(),
                qualityPending.workOrderId()
        );

        DemoWorkOrder qualityHold =
                commercialSeeder.createApprovedWorkOrder(
                        actors,
                        atlas,
                        "GA-2026-003",
                        "Eje secundario",
                        9,
                        "Acero AISI 4140",
                        WorkOrderPriority.URGENT,
                        "2880.00"
                );
        QualityInspectionResponse failedInspection =
                handoffToQuality(actors, qualityHold);

        startInspection(actors, failedInspection);
        qualityWorkflowService.addCheck(
                actors.quality().getId(),
                failedInspection.id(),
                passFailCheck(
                        "Inspección dimensional final",
                        QualityCheckResult.FAIL,
                        "El diámetro de ajuste quedó fuera de tolerancia."
                )
        );
        qualityWorkflowService.complete(
                actors.quality().getId(),
                failedInspection.id()
        );

        DemoWorkOrder readyForDelivery =
                commercialSeeder.createApprovedWorkOrder(
                        actors,
                        hidraulica,
                        "HM-2026-001",
                        "Adaptador hidráulico",
                        12,
                        "Acero inoxidable AISI 316",
                        WorkOrderPriority.NORMAL,
                        "2150.00"
                );
        approveQuality(actors, readyForDelivery);

        DemoWorkOrder preparedDelivery =
                commercialSeeder.createApprovedWorkOrder(
                        actors,
                        hidraulica,
                        "HM-2026-002",
                        "Bloque distribuidor hidráulico",
                        5,
                        "Acero AISI 1045",
                        WorkOrderPriority.HIGH,
                        "6400.00"
                );
        approveQuality(actors, preparedDelivery);
        createDelivery(actors, preparedDelivery);

        DemoWorkOrder dispatchedDelivery =
                commercialSeeder.createApprovedWorkOrder(
                        actors,
                        hidraulica,
                        "HM-2026-003",
                        "Manifold hidráulico",
                        7,
                        "Aluminio 7075-T6",
                        WorkOrderPriority.HIGH,
                        "4900.00"
                );
        approveQuality(actors, dispatchedDelivery);
        DeliveryResponse dispatched = createDelivery(
                actors,
                dispatchedDelivery
        );
        dispatch(actors, dispatched);

        DemoWorkOrder delivered =
                commercialSeeder.createApprovedWorkOrder(
                        actors,
                        hidraulica,
                        "HM-2026-004",
                        "Soporte de bomba",
                        4,
                        "Acero ASTM A36",
                        WorkOrderPriority.NORMAL,
                        "3750.00"
                );
        approveQuality(actors, delivered);

        DeliveryResponse completed = createDelivery(actors, delivered);
        dispatch(actors, completed);

        deliveryService.deliver(
                actors.logistics().getId(),
                completed.id(),
                new CompleteDeliveryRequest(
                        "Recepción de almacén",
                        Instant.now(),
                        null
                )
        );
    }

    private RoutingSheetResponse prepareAndReleaseRouting(
            DemoInternalActors actors,
            DemoWorkOrder workOrder
    ) {
        DocumentResponse drawing = createDemoDrawing(
                actors,
                workOrder
        );

        workOrderDocumentService.pin(
                actors.admin().getId(),
                workOrder.workOrderId(),
                drawing.id(),
                drawing.currentVersion().id()
        );

        RoutingSheetResponse routing =
                routingService.createProductionRouting(
                        actors.engineering().getId(),
                        workOrder.workOrderId()
                );

        routing = routingService.addOperation(
                actors.engineering().getId(),
                routing.id(),
                new CreateRoutingOperationRequest(
                        10,
                        "PREP-010",
                        "Preparación y montaje",
                        "Preparar material, fijación y referencias de trabajo.",
                        45
                )
        );

        routing = routingService.addOperation(
                actors.engineering().getId(),
                routing.id(),
                new CreateRoutingOperationRequest(
                        20,
                        "MEC-020",
                        "Mecanizado principal",
                        "Ejecutar mecanizado y verificar dimensiones críticas.",
                        120
                )
        );

        routingWorkflowService.approve(
                actors.engineering().getId(),
                routing.id()
        );

        return routingWorkflowService.release(
                actors.engineering().getId(),
                routing.id()
        );
    }

    private DocumentResponse createDemoDrawing(
            DemoInternalActors actors,
            DemoWorkOrder workOrder
    ) {
        byte[] contents = (
                "QualityTrack demo drawing\n"
                        + "Case: " + workOrder.request().caseId() + "\n"
                        + "Work order: " + workOrder.workOrderId() + "\n"
                        + "Generated only for local demo data.\n"
        ).getBytes(StandardCharsets.UTF_8);

        return documentService.create(
                actors.admin().getId(),
                new CreateDocumentRequest(
                        workOrder.request().caseId(),
                        "DRAWING",
                        "Plano de fabricación · " + workOrder.request().title(),
                        "Documento de prueba generado por el perfil seed-demo."
                ),
                new DemoMultipartFile(
                        "file",
                        "plano-demo-" + workOrder.workOrderId() + ".txt",
                        "text/plain",
                        contents
                )
        );
    }

    private void completeProduction(
            DemoInternalActors actors,
            DemoWorkOrder workOrder
    ) {
        RoutingSheetResponse routing =
                prepareAndReleaseRouting(actors, workOrder);

        for (RoutingOperationResponse operation : routing.operations()) {
            OperationExecutionResponse execution =
                    productionWorkflowService.start(
                            actors.production().getId(),
                            operation.id(),
                            new StartOperationExecutionRequest(
                                    null,
                                    null,
                                    "Ejecución demo para " + operation.name() + "."
                            )
                    );

            productionWorkflowService.complete(
                    actors.production().getId(),
                    execution.id(),
                    new CompleteOperationExecutionRequest(
                            workOrder.quantity(),
                            workOrder.quantity(),
                            0,
                            "Operación terminada sin rechazos."
                    )
            );
        }
    }

    private QualityInspectionResponse handoffToQuality(
            DemoInternalActors actors,
            DemoWorkOrder workOrder
    ) {
        completeProduction(actors, workOrder);

        return qualityWorkflowService.handoff(
                actors.production().getId(),
                workOrder.workOrderId()
        );
    }

    private void startInspection(
            DemoInternalActors actors,
            QualityInspectionResponse inspection
    ) {
        qualityWorkflowService.start(
                actors.quality().getId(),
                inspection.id(),
                new StartQualityInspectionRequest(null)
        );
    }

    private void approveQuality(
            DemoInternalActors actors,
            DemoWorkOrder workOrder
    ) {
        QualityInspectionResponse inspection =
                handoffToQuality(actors, workOrder);

        startInspection(actors, inspection);

        qualityWorkflowService.addCheck(
                actors.quality().getId(),
                inspection.id(),
                passFailCheck(
                        "Inspección final",
                        QualityCheckResult.PASS,
                        "Dimensiones y condición visual dentro de especificación."
                )
        );

        qualityWorkflowService.complete(
                actors.quality().getId(),
                inspection.id()
        );
    }

    private SaveQualityCheckRequest passFailCheck(
            String name,
            QualityCheckResult result,
            String notes
    ) {
        return new SaveQualityCheckRequest(
                QualityCheckType.PASS_FAIL,
                name,
                null,
                null,
                null,
                null,
                null,
                result,
                notes
        );
    }

    private DeliveryResponse createDelivery(
            DemoInternalActors actors,
            DemoWorkOrder workOrder
    ) {
        return deliveryService.create(
                actors.logistics().getId(),
                workOrder.workOrderId(),
                new CreateDeliveryRequest(
                        workOrder.quantity(),
                        "Planta principal",
                        "Recepción de almacén",
                        "Av. Industrial 1250",
                        workOrder.request().customer().customer().getCity(),
                        workOrder.request().customer().customer().getState(),
                        "63000",
                        "México",
                        "Entregar en acceso de proveedores.",
                        "LOCAL_DELIVERY"
                )
        );
    }

    private void dispatch(
            DemoInternalActors actors,
            DeliveryResponse delivery
    ) {
        deliveryService.dispatch(
                actors.logistics().getId(),
                delivery.id(),
                new DispatchDeliveryRequest(
                        "QualityTrack Demo Logistics",
                        "QT-DEMO-" + delivery.id()
                )
        );
    }
}
