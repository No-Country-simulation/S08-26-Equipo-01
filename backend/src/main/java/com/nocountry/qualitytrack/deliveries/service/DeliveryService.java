package com.nocountry.qualitytrack.deliveries.service;

import com.nocountry.qualitytrack.deliveries.dto.request.AttachDeliveryEvidenceRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.CancelDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.CompleteDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.CreateDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.DispatchDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.response.DeliveryResponse;
import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.documents.service.DocumentAccessService;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.documents.service.DocumentVersionMutationResult;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DeliveryService {

    private static final String DELIVERY_EVIDENCE_TYPE = "DELIVERY_EVIDENCE";

    private final DeliveryAccessPolicy accessPolicy;
    private final DeliveryRepository deliveryRepository;
    private final WorkOrderRepository workOrderRepository;
    private final JobCaseRepository jobCaseRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final DocumentAccessService documentAccessService;
    private final DocumentService documentService;
    private final TraceabilityService traceabilityService;

    @Transactional
    public DeliveryResponse create(
            Long currentUserId,
            Long workOrderId,
            CreateDeliveryRequest request
    ) {
        User actor = accessPolicy.requireLogisticsActor(currentUserId);
        WorkOrder workOrder = requireWorkOrderForUpdate(workOrderId);
        requireReadyForDelivery(workOrder);

        long committedQuantity = deliveryRepository.sumCommittedQuantityByWorkOrderId(
                workOrderId,
                DeliveryStatus.CANCELLED
        );
        long projectedQuantity = committedQuantity + request.quantity();
        if (projectedQuantity > workOrder.getPlannedQuantity()) {
            conflict("La cantidad comprometida en entregas no canceladas no puede exceder la cantidad planeada de la OT.");
        }

        Delivery delivery;
        try {
            delivery = Delivery.create(
                    workOrder,
                    request.quantity(),
                    request.destinationLabel(),
                    request.destinationContactName(),
                    request.destinationAddress(),
                    request.destinationCity(),
                    request.destinationState(),
                    request.destinationPostalCode(),
                    request.destinationCountry(),
                    request.destinationInstructions(),
                    request.deliveryMethod(),
                    actor
            );
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        delivery = deliveryRepository.saveAndFlush(delivery);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.DELIVERY,
                delivery.getId(),
                TraceabilityEventType.DELIVERY_CREATED,
                null,
                DeliveryStatus.PENDING.name(),
                currentUserId,
                metadata(
                        "workOrderId", workOrder.getId(),
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "quantity", delivery.getQuantity(),
                        "committedQuantity", projectedQuantity,
                        "plannedQuantity", workOrder.getPlannedQuantity(),
                        "deliveryMethod", delivery.getDeliveryMethod(),
                        "destinationLabel", delivery.getDestinationLabel(),
                        "destinationCity", delivery.getDestinationCity(),
                        "destinationState", delivery.getDestinationState()
                )
        );

        return DeliveryResponse.from(delivery);
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> listByWorkOrder(Long currentUserId, Long workOrderId) {
        accessPolicy.requireInternalReader(currentUserId);
        if (!workOrderRepository.existsById(workOrderId)) {
            throw notFound("No se encontró la orden de trabajo.");
        }

        return deliveryRepository.findAllByWorkOrder_IdOrderByCreatedAtAscIdAsc(workOrderId)
                .stream()
                .map(DeliveryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> listAll(Long currentUserId) {
        accessPolicy.requireInternalReader(currentUserId);
        return deliveryRepository.findAllByOrderByCreatedAtDescIdDesc()
                .stream()
                .map(DeliveryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DeliveryResponse get(Long currentUserId, Long deliveryId) {
        accessPolicy.requireInternalReader(currentUserId);
        return DeliveryResponse.from(
                deliveryRepository.findById(deliveryId)
                        .orElseThrow(() -> notFound("No se encontró la entrega."))
        );
    }

    @Transactional
    public DeliveryResponse dispatch(
            Long currentUserId,
            Long deliveryId,
            DispatchDeliveryRequest request
    ) {
        User actor = accessPolicy.requireLogisticsActor(currentUserId);
        LockedDelivery locked = lockWorkOrderThenDelivery(deliveryId);
        WorkOrder workOrder = locked.workOrder();
        Delivery delivery = locked.delivery();
        requireReadyForDelivery(workOrder);

        DeliveryStatus previousStatus = delivery.getStatus();
        try {
            delivery.dispatch(
                    actor,
                    request == null ? null : request.carrier(),
                    request == null ? null : request.trackingNumber(),
                    Instant.now()
            );
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        delivery = deliveryRepository.saveAndFlush(delivery);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.DELIVERY,
                delivery.getId(),
                TraceabilityEventType.DELIVERY_DISPATCHED,
                previousStatus.name(),
                delivery.getStatus().name(),
                currentUserId,
                metadata(
                        "quantity", delivery.getQuantity(),
                        "carrier", delivery.getCarrier(),
                        "trackingNumber", delivery.getTrackingNumber(),
                        "dispatchedAt", delivery.getDispatchedAt()
                )
        );

        return DeliveryResponse.from(delivery);
    }

    @Transactional
    public DeliveryResponse attachEvidence(
            Long currentUserId,
            Long deliveryId,
            AttachDeliveryEvidenceRequest request
    ) {
        accessPolicy.requireLogisticsActor(currentUserId);
        LockedDelivery locked = lockWorkOrderThenDelivery(deliveryId);
        Delivery delivery = locked.delivery();
        DocumentVersion evidence = requireEvidence(
                request.documentVersionId(),
                locked.workOrder().getJobCase().getId()
        );
        documentAccessService.requireCanRead(currentUserId, evidence.getDocument());

        try {
            delivery.attachEvidence(evidence);
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        delivery = deliveryRepository.saveAndFlush(delivery);

        traceabilityService.record(
                locked.workOrder().getJobCase(),
                TraceabilityAggregateType.DELIVERY,
                delivery.getId(),
                TraceabilityEventType.DELIVERY_EVIDENCE_ATTACHED,
                delivery.getStatus().name(),
                delivery.getStatus().name(),
                currentUserId,
                metadata("documentVersionId", evidence.getId())
        );

        return DeliveryResponse.from(delivery);
    }

    @Transactional
    public DeliveryResponse uploadEvidence(
            Long currentUserId,
            Long deliveryId,
            MultipartFile file
    ) {
        accessPolicy.requireLogisticsActor(currentUserId);
        LockedDelivery locked = lockWorkOrderThenDelivery(deliveryId);
        WorkOrder workOrder = locked.workOrder();
        Delivery delivery = locked.delivery();
        requireReadyForDelivery(workOrder);

        if (delivery.getStatus() != DeliveryStatus.PENDING
                && delivery.getStatus() != DeliveryStatus.DISPATCHED) {
            conflict("La evidencia solo puede modificarse antes de confirmar la entrega.");
        }

        Long caseId = workOrder.getJobCase().getId();
        DocumentVersion evidence;
        Long documentId;

        if (delivery.getEvidenceDocumentVersion() == null) {
            DocumentResponse document = documentService.create(
                    currentUserId,
                    new CreateDocumentRequest(
                            caseId,
                            DELIVERY_EVIDENCE_TYPE,
                            "Evidencia entrega #" + delivery.getId(),
                            "Evidencia de entrega de la OT " + workOrder.getWorkOrderNumber() + "."
                    ),
                    file
            );

            documentId = document.id();
            evidence = documentVersionRepository.getReferenceById(
                    document.currentVersion().id()
            );

            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.DOCUMENT,
                    documentId,
                    TraceabilityEventType.DOCUMENT_ADDED,
                    null,
                    null,
                    currentUserId,
                    metadata(
                            "deliveryId", delivery.getId(),
                            "documentType", DELIVERY_EVIDENCE_TYPE,
                            "fileName", document.currentVersion().fileName()
                    )
            );
        } else {
            documentId = delivery.getEvidenceDocumentVersion().getDocument().getId();
            DocumentVersionMutationResult result = documentService.addVersion(
                    currentUserId,
                    caseId,
                    documentId,
                    file
            );

            evidence = documentVersionRepository.getReferenceById(
                    result.version().id()
            );

            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.DOCUMENT_VERSION,
                    result.version().id(),
                    TraceabilityEventType.DOCUMENT_VERSION_ADDED,
                    null,
                    null,
                    currentUserId,
                    metadata(
                            "deliveryId", delivery.getId(),
                            "documentId", documentId,
                            "version", result.version().version(),
                            "fileName", result.version().fileName()
                    )
            );
        }

        try {
            delivery.attachEvidence(evidence);
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        delivery = deliveryRepository.saveAndFlush(delivery);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.DELIVERY,
                delivery.getId(),
                TraceabilityEventType.DELIVERY_EVIDENCE_ATTACHED,
                delivery.getStatus().name(),
                delivery.getStatus().name(),
                currentUserId,
                metadata(
                        "documentId", documentId,
                        "documentVersionId", evidence.getId()
                )
        );

        return DeliveryResponse.from(delivery);
    }

    @Transactional
    public DeliveryResponse cancel(
            Long currentUserId,
            Long deliveryId,
            CancelDeliveryRequest request
    ) {
        User actor = accessPolicy.requireLogisticsActor(currentUserId);
        LockedDelivery locked = lockWorkOrderThenDelivery(deliveryId);
        WorkOrder workOrder = locked.workOrder();
        Delivery delivery = locked.delivery();
        requireReadyForDelivery(workOrder);

        DeliveryStatus previousStatus = delivery.getStatus();
        try {
            delivery.cancel(actor, request.reason(), Instant.now());
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        delivery = deliveryRepository.saveAndFlush(delivery);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.DELIVERY,
                delivery.getId(),
                TraceabilityEventType.DELIVERY_CANCELLED,
                previousStatus.name(),
                DeliveryStatus.CANCELLED.name(),
                currentUserId,
                metadata(
                        "quantity", delivery.getQuantity(),
                        "reason", delivery.getCancellationReason()
                )
        );

        return DeliveryResponse.from(delivery);
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> listForCustomerRequest(
            Long currentUserId,
            Long customerId,
            Long requestId
    ) {
        accessPolicy.requireCustomerReader(currentUserId, customerId);
        requireCustomerRequest(customerId, requestId);

        return deliveryRepository
                .findAllByWorkOrder_JobCase_CustomerRequest_IdAndWorkOrder_JobCase_CustomerRequest_Customer_IdOrderByCreatedAtAscIdAsc(
                        requestId,
                        customerId
                )
                .stream()
                .filter(this::isCustomerVisible)
                .map(DeliveryResponse::from)
                .toList();
    }

    @Transactional
    public DeliveryResponse deliver(
            Long currentUserId,
            Long deliveryId,
            CompleteDeliveryRequest request
    ) {
        User actor = accessPolicy.requireLogisticsActor(currentUserId);
        LockedDelivery locked = lockWorkOrderThenDelivery(deliveryId);
        WorkOrder workOrder = locked.workOrder();
        Delivery delivery = locked.delivery();

        requireReadyForDelivery(workOrder);

        if (request.evidenceDocumentVersionId() != null) {
            DocumentVersion evidence = requireEvidence(
                    request.evidenceDocumentVersionId(),
                    workOrder.getJobCase().getId()
            );
            documentAccessService.requireCanRead(currentUserId, evidence.getDocument());

            try {
                delivery.attachEvidence(evidence);
            } catch (IllegalArgumentException | IllegalStateException exception) {
                conflict(exception.getMessage());
            }
        }

        DeliveryStatus previousStatus = delivery.getStatus();
        try {
            delivery.markDelivered(
                    actor,
                    request.receivedByName(),
                    request.deliveredAt()
            );
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        delivery = deliveryRepository.saveAndFlush(delivery);

        long deliveredQuantity = deliveryRepository.sumDeliveredQuantityByWorkOrderId(
                workOrder.getId(),
                DeliveryStatus.DELIVERED
        );
        if (deliveredQuantity > workOrder.getPlannedQuantity()) {
            conflict("La cantidad entregada no puede exceder la cantidad planeada de la OT.");
        }

        boolean workOrderCompleted = deliveredQuantity == workOrder.getPlannedQuantity();
        WorkOrderStatus previousWorkOrderStatus = workOrder.getStatus();
        JobCase completedJobCase = null;
        JobCaseStatus previousJobCaseStatus = null;

        if (workOrderCompleted) {
            try {
                workOrder.markDelivered();
            } catch (IllegalStateException exception) {
                conflict(exception.getMessage());
            }
            workOrderRepository.saveAndFlush(workOrder);

            completedJobCase = workOrder.getJobCase();
            previousJobCaseStatus = completedJobCase.getStatus();
            Instant completedAt = deliveryRepository
                    .findLatestDeliveredAtByWorkOrderId(
                            workOrder.getId(),
                            DeliveryStatus.DELIVERED
                    )
                    .orElse(delivery.getDeliveredAt());
            try {
                completedJobCase.complete(completedAt);
            } catch (IllegalArgumentException | IllegalStateException exception) {
                conflict(exception.getMessage());
            }
            jobCaseRepository.saveAndFlush(completedJobCase);
        }

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.DELIVERY,
                delivery.getId(),
                TraceabilityEventType.DELIVERY_DELIVERED,
                previousStatus.name(),
                DeliveryStatus.DELIVERED.name(),
                currentUserId,
                metadata(
                        "quantity", delivery.getQuantity(),
                        "receivedByName", delivery.getReceivedByName(),
                        "deliveredAt", delivery.getDeliveredAt(),
                        "evidenceDocumentVersionId",
                        delivery.getEvidenceDocumentVersion() == null
                                ? null
                                : delivery.getEvidenceDocumentVersion().getId(),
                        "deliveredQuantity", deliveredQuantity,
                        "plannedQuantity", workOrder.getPlannedQuantity()
                )
        );

        if (workOrderCompleted) {
            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.WORK_ORDER,
                    workOrder.getId(),
                    TraceabilityEventType.WORK_ORDER_DELIVERED,
                    previousWorkOrderStatus.name(),
                    workOrder.getStatus().name(),
                    currentUserId,
                    metadata(
                            "workOrderNumber", workOrder.getWorkOrderNumber(),
                            "deliveredQuantity", deliveredQuantity
                    )
            );

            traceabilityService.record(
                    completedJobCase,
                    TraceabilityAggregateType.JOB_CASE,
                    completedJobCase.getId(),
                    TraceabilityEventType.JOB_CASE_COMPLETED,
                    previousJobCaseStatus.name(),
                    JobCaseStatus.COMPLETED.name(),
                    currentUserId,
                    metadata(
                            "caseNumber", completedJobCase.getCaseNumber(),
                            "workOrderId", workOrder.getId(),
                            "workOrderNumber", workOrder.getWorkOrderNumber(),
                            "finalDeliveryId", delivery.getId(),
                            "finalDeliveredAt", delivery.getDeliveredAt(),
                            "deliveredQuantity", deliveredQuantity,
                            "plannedQuantity", workOrder.getPlannedQuantity()
                    )
            );
        }

        return DeliveryResponse.from(delivery);
    }

    private LockedDelivery lockWorkOrderThenDelivery(Long deliveryId) {
        Long workOrderId = deliveryRepository.findWorkOrderIdById(deliveryId)
                .orElseThrow(() -> notFound("No se encontró la entrega."));

        WorkOrder workOrder = requireWorkOrderForUpdate(workOrderId);
        Delivery delivery = deliveryRepository.findByIdForUpdate(deliveryId)
                .orElseThrow(() -> notFound("No se encontró la entrega."));

        if (!delivery.getWorkOrder().getId().equals(workOrder.getId())) {
            conflict("La entrega ya no pertenece a la orden de trabajo esperada.");
        }
        return new LockedDelivery(workOrder, delivery);
    }

    private WorkOrder requireWorkOrderForUpdate(Long workOrderId) {
        return workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));
    }

    private void requireReadyForDelivery(WorkOrder workOrder) {
        if (workOrder.getStatus() != WorkOrderStatus.READY_FOR_DELIVERY) {
            conflict("La orden debe estar READY_FOR_DELIVERY para gestionar entregas.");
        }
    }

    private JobCase requireCustomerRequest(Long customerId, Long requestId) {
        return jobCaseRepository
                .findByCustomerRequest_IdAndCustomerRequest_Customer_Id(requestId, customerId)
                .orElseThrow(() -> notFound("No se encontró la solicitud."));
    }

    private DocumentVersion requireEvidence(Long versionId, Long caseId) {
        DocumentVersion version = documentVersionRepository
                .findByIdAndDocument_JobCase_IdAndDocument_Status(
                        versionId,
                        caseId,
                        DocumentStatus.ACTIVE
                )
                .orElseThrow(() -> notFound(
                        "No se encontró la versión de evidencia dentro del expediente."
                ));

        if (!DELIVERY_EVIDENCE_TYPE.equals(version.getDocument().getDocumentType())) {
            conflict("La versión seleccionada debe pertenecer a un documento DELIVERY_EVIDENCE.");
        }
        return version;
    }

    private boolean isCustomerVisible(Delivery delivery) {
        return delivery.getStatus() == DeliveryStatus.DISPATCHED
                || delivery.getStatus() == DeliveryStatus.DELIVERED
                || (delivery.getStatus() == DeliveryStatus.CANCELLED
                && delivery.getDispatchedAt() != null);
    }

    private Map<String, Object> metadata(Object... entries) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        for (int index = 0; index < entries.length; index += 2) {
            Object value = entries[index + 1];
            if (value != null) {
                metadata.put(String.valueOf(entries[index]), value);
            }
        }
        return metadata;
    }

    private BusinessException notFound(String message) {
        return new BusinessException(ApiErrorCode.RESOURCE_NOT_FOUND, message);
    }

    private void conflict(String message) {
        throw new BusinessException(ApiErrorCode.DATA_CONFLICT, message);
    }

    private record LockedDelivery(
            WorkOrder workOrder,
            Delivery delivery
    ) {
    }
}
