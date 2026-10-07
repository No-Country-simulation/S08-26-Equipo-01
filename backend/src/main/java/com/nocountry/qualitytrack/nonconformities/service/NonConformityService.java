package com.nocountry.qualitytrack.nonconformities.service;

import com.nocountry.qualitytrack.nonconformities.dto.request.AuthorizeUseAsIsRequest;
import com.nocountry.qualitytrack.nonconformities.dto.request.UpdateNonConformityRequest;
import com.nocountry.qualitytrack.nonconformities.dto.response.NonConformityResponse;
import com.nocountry.qualitytrack.nonconformities.dto.response.ScrapResolutionResponse;
import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityDisposition;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.nonconformities.repository.NonConformityRepository;
import com.nocountry.qualitytrack.production.entity.OperationExecution;
import com.nocountry.qualitytrack.production.enums.OperationExecutionStatus;
import com.nocountry.qualitytrack.production.repository.OperationExecutionRepository;
import com.nocountry.qualitytrack.routing.dto.response.RoutingSheetResponse;
import com.nocountry.qualitytrack.routing.entity.RoutingOperation;
import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.repository.RoutingSheetRepository;
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

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NonConformityService {

    private final NonConformityAccessPolicy accessPolicy;
    private final NonConformityRepository nonConformityRepository;
    private final WorkOrderRepository workOrderRepository;
    private final RoutingSheetRepository routingSheetRepository;
    private final OperationExecutionRepository executionRepository;
    private final TraceabilityService traceabilityService;

    @Transactional(readOnly = true)
    public NonConformityResponse get(Long currentUserId, Long nonConformityId) {
        accessPolicy.requireInternalReader(currentUserId);
        return NonConformityResponse.from(
                nonConformityRepository.findById(nonConformityId)
                        .orElseThrow(() -> notFound("No se encontró la no conformidad."))
        );
    }

    @Transactional(readOnly = true)
    public List<NonConformityResponse> listByWorkOrder(
            Long currentUserId,
            Long workOrderId
    ) {
        accessPolicy.requireInternalReader(currentUserId);

        if (!workOrderRepository.existsById(workOrderId)) {
            throw notFound("No se encontró la orden de trabajo.");
        }

        return nonConformityRepository
                .findAllByWorkOrder_IdOrderByOpenedAtAscIdAsc(workOrderId)
                .stream()
                .map(NonConformityResponse::from)
                .toList();
    }

    @Transactional
    public NonConformityResponse updateDetails(
            Long currentUserId,
            Long nonConformityId,
            UpdateNonConformityRequest request
    ) {
        accessPolicy.requireQualityActor(currentUserId);
        LockedNonConformity locked = lockWorkOrderThenNonConformity(nonConformityId);
        NonConformity nonConformity = locked.nonConformity();

        Integer previousAffectedQuantity = nonConformity.getAffectedQuantity();
        String previousSeverity = nonConformity.getSeverity();
        String previousDescription = nonConformity.getDescription();

        try {
            nonConformity.updateDetails(
                    request.affectedQuantity(),
                    request.severity(),
                    request.description()
            );
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        nonConformity = nonConformityRepository.saveAndFlush(nonConformity);

        traceabilityService.record(
                locked.workOrder().getJobCase(),
                TraceabilityAggregateType.NON_CONFORMITY,
                nonConformity.getId(),
                TraceabilityEventType.NON_CONFORMITY_DETAILS_UPDATED,
                nonConformity.getStatus().name(),
                nonConformity.getStatus().name(),
                currentUserId,
                metadata(
                        "previousAffectedQuantity", previousAffectedQuantity,
                        "previousSeverity", previousSeverity,
                        "previousDescription", previousDescription,
                        "affectedQuantity", nonConformity.getAffectedQuantity(),
                        "severity", nonConformity.getSeverity(),
                        "description", nonConformity.getDescription()
                )
        );

        return NonConformityResponse.from(nonConformity);
    }

    @Transactional
    public RoutingSheetResponse createReworkRouting(
            Long currentUserId,
            Long nonConformityId
    ) {
        User actor = accessPolicy.requireEngineeringActor(currentUserId);
        LockedNonConformity locked = lockWorkOrderThenNonConformity(nonConformityId);
        WorkOrder workOrder = locked.workOrder();
        NonConformity nonConformity = locked.nonConformity();

        requireQualityHold(workOrder);
        requireOpen(nonConformity);
        ensurePreviousReworkFinished(nonConformity);

        NonConformityDisposition previousDisposition = nonConformity.getDisposition();

        try {
            nonConformity.selectRework();
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        int nextRevision = routingSheetRepository
                .findMaxRevisionByWorkOrderId(workOrder.getId()) + 1;

        RoutingSheet routingSheet;
        try {
            routingSheet = RoutingSheet.createRework(
                    workOrder,
                    nextRevision,
                    nonConformity,
                    actor
            );
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        nonConformityRepository.save(nonConformity);
        routingSheet = routingSheetRepository.saveAndFlush(routingSheet);

        if (previousDisposition == null) {
            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.NON_CONFORMITY,
                    nonConformity.getId(),
                    TraceabilityEventType.NON_CONFORMITY_REWORK_SELECTED,
                    null,
                    NonConformityDisposition.REWORK.name(),
                    currentUserId,
                    metadata(
                            "number", nonConformity.getNonConformityNumber(),
                            "affectedQuantity", nonConformity.getAffectedQuantity()
                    )
            );
        }

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.ROUTING_SHEET,
                routingSheet.getId(),
                TraceabilityEventType.ROUTING_SHEET_CREATED,
                null,
                routingSheet.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderId", workOrder.getId(),
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "revision", routingSheet.getRevision(),
                        "purpose", routingSheet.getPurpose(),
                        "nonConformityId", nonConformity.getId()
                )
        );

        return RoutingSheetResponse.from(routingSheet);
    }

    @Transactional
    public ScrapResolutionResponse recordScrap(
            Long currentUserId,
            Long nonConformityId
    ) {
        User actor = accessPolicy.requireResolutionActor(currentUserId);
        LockedNonConformity locked = lockWorkOrderThenNonConformity(nonConformityId);
        WorkOrder workOrder = locked.workOrder();
        NonConformity nonConformity = locked.nonConformity();

        requireQualityHold(workOrder);
        requireOpen(nonConformity);

        NonConformityDisposition previousDisposition = nonConformity.getDisposition();

        try {
            nonConformity.recordScrap();
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        int acceptedBeforeScrap = terminalProductionAcceptedQuantity(workOrder.getId());
        int remainingAccepted = Math.max(
                0,
                acceptedBeforeScrap - nonConformity.getAffectedQuantity()
        );
        boolean readyForDelivery =
                remainingAccepted >= workOrder.getPlannedQuantity();

        if (readyForDelivery) {
            try {
                nonConformity.closeAfterScrap(actor, Instant.now());
                workOrder.resolveQualityHoldForDelivery();
            } catch (IllegalArgumentException | IllegalStateException exception) {
                conflict(exception.getMessage());
            }
        }

        nonConformity = nonConformityRepository.saveAndFlush(nonConformity);
        workOrderRepository.saveAndFlush(workOrder);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.NON_CONFORMITY,
                nonConformity.getId(),
                TraceabilityEventType.NON_CONFORMITY_SCRAP_RECORDED,
                previousDisposition == null ? null : previousDisposition.name(),
                NonConformityDisposition.SCRAP.name(),
                currentUserId,
                metadata(
                        "affectedQuantity", nonConformity.getAffectedQuantity(),
                        "acceptedQuantityBeforeScrap", acceptedBeforeScrap,
                        "remainingAcceptedQuantity", remainingAccepted,
                        "plannedQuantity", workOrder.getPlannedQuantity(),
                        "readyForDelivery", readyForDelivery
                )
        );

        if (readyForDelivery) {
            traceClosure(workOrder, nonConformity, currentUserId);
        }

        return new ScrapResolutionResponse(
                NonConformityResponse.from(nonConformity),
                acceptedBeforeScrap,
                nonConformity.getAffectedQuantity(),
                remainingAccepted,
                workOrder.getPlannedQuantity(),
                readyForDelivery
        );
    }

    @Transactional
    public NonConformityResponse authorizeUseAsIs(
            Long currentUserId,
            Long nonConformityId,
            AuthorizeUseAsIsRequest request
    ) {
        User actor = accessPolicy.requireAdminActor(currentUserId);
        LockedNonConformity locked = lockWorkOrderThenNonConformity(nonConformityId);
        WorkOrder workOrder = locked.workOrder();
        NonConformity nonConformity = locked.nonConformity();

        requireQualityHold(workOrder);
        requireOpen(nonConformity);

        try {
            nonConformity.authorizeUseAsIs(
                    actor,
                    request.reason(),
                    Instant.now()
            );
            workOrder.resolveQualityHoldForDelivery();
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        nonConformity = nonConformityRepository.saveAndFlush(nonConformity);
        workOrderRepository.saveAndFlush(workOrder);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.NON_CONFORMITY,
                nonConformity.getId(),
                TraceabilityEventType.NON_CONFORMITY_USE_AS_IS_AUTHORIZED,
                NonConformityStatus.OPEN.name(),
                NonConformityStatus.CLOSED.name(),
                currentUserId,
                metadata(
                        "authorizedByUserId", actor.getId(),
                        "reason", nonConformity.getResolutionNotes()
                )
        );

        traceClosure(workOrder, nonConformity, currentUserId);

        return NonConformityResponse.from(nonConformity);
    }

    private LockedNonConformity lockWorkOrderThenNonConformity(Long nonConformityId) {
        Long workOrderId = nonConformityRepository
                .findWorkOrderIdById(nonConformityId)
                .orElseThrow(() -> notFound("No se encontró la no conformidad."));

        WorkOrder workOrder = workOrderRepository
                .findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));

        NonConformity nonConformity = nonConformityRepository
                .findByIdForUpdate(nonConformityId)
                .orElseThrow(() -> notFound("No se encontró la no conformidad."));

        if (!nonConformity.getWorkOrder().getId().equals(workOrder.getId())) {
            conflict("La no conformidad ya no pertenece a la orden de trabajo esperada.");
        }

        return new LockedNonConformity(workOrder, nonConformity);
    }

    private void ensurePreviousReworkFinished(NonConformity nonConformity) {
        List<RoutingSheet> routes = routingSheetRepository
                .findAllByNonConformity_IdOrderByRevisionAsc(nonConformity.getId());

        if (routes.isEmpty()) {
            return;
        }

        RoutingSheet latest = routes.get(routes.size() - 1);
        boolean completed = !latest.getOperations().isEmpty()
                && latest.getOperations().stream().allMatch(operation ->
                executionRepository.existsByRoutingOperation_IdAndStatus(
                        operation.getId(),
                        OperationExecutionStatus.COMPLETED
                ));

        if (!completed) {
            conflict(
                    "La no conformidad ya tiene una ruta de retrabajo pendiente o en ejecución."
            );
        }
    }

    private int terminalProductionAcceptedQuantity(Long workOrderId) {
        RoutingSheet productionRouting = routingSheetRepository
                .findByWorkOrder_IdAndPurpose(
                        workOrderId,
                        RoutingPurpose.PRODUCTION
                )
                .orElseThrow(() -> conflictException(
                        "No se encontró la ruta de producción original."
                ));

        RoutingOperation terminalOperation = productionRouting.getOperations()
                .stream()
                .max((left, right) -> Integer.compare(
                        left.getSequenceNumber(),
                        right.getSequenceNumber()
                ))
                .orElseThrow(() -> conflictException(
                        "La ruta de producción no tiene operaciones."
                ));

        OperationExecution execution = executionRepository
                .findFirstByRoutingOperation_IdAndStatusOrderByAttemptNumberDesc(
                        terminalOperation.getId(),
                        OperationExecutionStatus.COMPLETED
                )
                .orElseThrow(() -> conflictException(
                        "La operación final de producción no tiene una ejecución completada."
                ));

        return execution.getQuantityAccepted();
    }

    private void traceClosure(
            WorkOrder workOrder,
            NonConformity nonConformity,
            Long currentUserId
    ) {
        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.NON_CONFORMITY,
                nonConformity.getId(),
                TraceabilityEventType.NON_CONFORMITY_CLOSED,
                NonConformityStatus.OPEN.name(),
                NonConformityStatus.CLOSED.name(),
                currentUserId,
                metadata(
                        "disposition", nonConformity.getDisposition(),
                        "resolvedByUserId", nonConformity.getResolvedByUser().getId(),
                        "closedAt", nonConformity.getClosedAt()
                )
        );

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.WORK_ORDER,
                workOrder.getId(),
                TraceabilityEventType.WORK_ORDER_NC_RESOLVED,
                WorkOrderStatus.QUALITY_HOLD.name(),
                WorkOrderStatus.READY_FOR_DELIVERY.name(),
                currentUserId,
                metadata(
                        "nonConformityId", nonConformity.getId(),
                        "disposition", nonConformity.getDisposition()
                )
        );
    }

    private void requireQualityHold(WorkOrder workOrder) {
        if (workOrder.getStatus() != WorkOrderStatus.QUALITY_HOLD) {
            conflict("La orden debe estar QUALITY_HOLD para resolver la no conformidad.");
        }
    }

    private void requireOpen(NonConformity nonConformity) {
        if (nonConformity.getStatus() != NonConformityStatus.OPEN) {
            conflict("La no conformidad ya está cerrada.");
        }
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

    private BusinessException conflictException(String message) {
        return new BusinessException(ApiErrorCode.DATA_CONFLICT, message);
    }

    private void conflict(String message) {
        throw conflictException(message);
    }

    private record LockedNonConformity(
            WorkOrder workOrder,
            NonConformity nonConformity
    ) {
    }
}
