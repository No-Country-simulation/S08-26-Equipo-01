package com.nocountry.qualitytrack.quality.service;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.repository.NonConformityRepository;
import com.nocountry.qualitytrack.nonconformities.service.NonConformityReferenceGenerator;
import com.nocountry.qualitytrack.quality.dto.request.SaveQualityCheckRequest;
import com.nocountry.qualitytrack.quality.dto.request.StartQualityInspectionRequest;
import com.nocountry.qualitytrack.quality.dto.response.QualityInspectionResponse;
import com.nocountry.qualitytrack.quality.dto.response.QualityCheckResponse;
import com.nocountry.qualitytrack.quality.entity.QualityInspection;
import com.nocountry.qualitytrack.quality.entity.QualityCheck;
import com.nocountry.qualitytrack.quality.enums.QualityInspectionStatus;
import com.nocountry.qualitytrack.quality.enums.QualityCheckResult;
import com.nocountry.qualitytrack.quality.enums.QualityCheckType;
import com.nocountry.qualitytrack.quality.repository.QualityInspectionRepository;
import com.nocountry.qualitytrack.quality.repository.QualityCheckRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import com.nocountry.qualitytrack.workorders.service.WorkOrderAccessPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QualityWorkflowService {

    private final WorkOrderAccessPolicy accessPolicy;
    private final WorkOrderRepository workOrderRepository;
    private final QualityInspectionRepository inspectionRepository;
    private final QualityCheckRepository checkRepository;
    private final NonConformityRepository nonConformityRepository;
    private final NonConformityReferenceGenerator nonConformityReferenceGenerator;
    private final TraceabilityService traceabilityService;

    @Transactional
    public QualityInspectionResponse handoff(Long currentUserId, Long workOrderId) {
        accessPolicy.requireProductionActor(currentUserId);

        WorkOrder workOrder = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));

        if (workOrder.getStatus() != WorkOrderStatus.IN_PRODUCTION
                || !workOrder.isProductionCompleted()) {
            conflict("La producción debe estar completa antes de enviar la orden a Calidad.");
        }

        QualityInspection inspection;
        try {
            inspection = QualityInspection.createPending(workOrder);
            workOrder.sendToQuality();
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        inspection = inspectionRepository.saveAndFlush(inspection);
        workOrderRepository.saveAndFlush(workOrder);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.WORK_ORDER,
                workOrder.getId(),
                TraceabilityEventType.QUALITY_HANDOFF,
                WorkOrderStatus.IN_PRODUCTION.name(),
                WorkOrderStatus.QUALITY_PENDING.name(),
                currentUserId,
                metadata(
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "qualityInspectionId", inspection.getId()
                )
        );

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.QUALITY_INSPECTION,
                inspection.getId(),
                TraceabilityEventType.QUALITY_INSPECTION_CREATED,
                null,
                QualityInspectionStatus.PENDING.name(),
                currentUserId,
                metadata("workOrderId", workOrder.getId())
        );

        return toResponse(inspection);
    }

    @Transactional
    public QualityInspectionResponse start(
            Long currentUserId,
            Long inspectionId,
            StartQualityInspectionRequest request
    ) {
        User actor = accessPolicy.requireQualityActor(currentUserId);
        LockedInspection locked = lockWorkOrderThenInspection(inspectionId);
        WorkOrder workOrder = locked.workOrder();
        QualityInspection inspection = locked.inspection();

        if (workOrder.getStatus() != WorkOrderStatus.QUALITY_PENDING) {
            conflict("La orden debe estar QUALITY_PENDING para iniciar una inspección.");
        }

        User inspector = request.inspectorId() == null
                ? actor
                : accessPolicy.requireQualityActor(request.inspectorId());

        QualityInspectionStatus previousStatus = inspection.getStatus();
        try {
            inspection.start(inspector, Instant.now());
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        inspection = inspectionRepository.saveAndFlush(inspection);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.QUALITY_INSPECTION,
                inspection.getId(),
                TraceabilityEventType.QUALITY_INSPECTION_STARTED,
                previousStatus.name(),
                inspection.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderId", workOrder.getId(),
                        "inspectorId", inspector.getId()
                )
        );

        return toResponse(inspection);
    }

    @Transactional
    public QualityCheckResponse addCheck(
            Long currentUserId,
            Long inspectionId,
            SaveQualityCheckRequest request
    ) {
        accessPolicy.requireQualityActor(currentUserId);
        LockedInspection locked = lockWorkOrderThenInspection(inspectionId);
        WorkOrder workOrder = locked.workOrder();
        QualityInspection inspection = locked.inspection();
        requireAssignedActor(currentUserId, inspection);
        requireOpenInspection(workOrder, inspection);

        QualityCheck qualityCheck;
        try {
            qualityCheck = createCheck(inspection, request);
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        qualityCheck = checkRepository.saveAndFlush(qualityCheck);

        traceCheck(
                workOrder,
                inspection,
                qualityCheck,
                TraceabilityEventType.QUALITY_CHECK_RECORDED,
                currentUserId,
                null,
                null
        );

        return QualityCheckResponse.from(qualityCheck);
    }

    @Transactional
    public QualityCheckResponse updateCheck(
            Long currentUserId,
            Long inspectionId,
            Long checkId,
            SaveQualityCheckRequest request
    ) {
        accessPolicy.requireQualityActor(currentUserId);

        Long checkInspectionId = checkRepository
                .findInspectionIdById(checkId)
                .orElseThrow(() -> notFound("No se encontró el control de calidad."));

        if (!inspectionId.equals(checkInspectionId)) {
            conflict("El control no pertenece a la inspección indicada.");
        }

        LockedInspection locked = lockWorkOrderThenInspection(inspectionId);
        WorkOrder workOrder = locked.workOrder();
        QualityInspection inspection = locked.inspection();
        requireAssignedActor(currentUserId, inspection);
        requireOpenInspection(workOrder, inspection);

        QualityCheck qualityCheck = checkRepository
                .findByIdForUpdate(checkId)
                .orElseThrow(() -> notFound("No se encontró el control de calidad."));

        QualityCheckResult previousResult = qualityCheck.getResult();
        Map<String, Object> previousCheck = metadata(
                "type", qualityCheck.getType(),
                "name", qualityCheck.getName(),
                "nominalValue", qualityCheck.getNominalValue(),
                "lowerLimit", qualityCheck.getLowerLimit(),
                "upperLimit", qualityCheck.getUpperLimit(),
                "measuredValue", qualityCheck.getMeasuredValue(),
                "unit", qualityCheck.getUnit(),
                "notes", qualityCheck.getNotes()
        );

        try {
            updateCheck(qualityCheck, request);
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        qualityCheck = checkRepository.saveAndFlush(qualityCheck);

        traceCheck(
                workOrder,
                inspection,
                qualityCheck,
                TraceabilityEventType.QUALITY_CHECK_UPDATED,
                currentUserId,
                previousResult,
                previousCheck
        );

        return QualityCheckResponse.from(qualityCheck);
    }

    @Transactional
    public QualityInspectionResponse complete(Long currentUserId, Long inspectionId) {
        accessPolicy.requireQualityActor(currentUserId);
        LockedInspection locked = lockWorkOrderThenInspection(inspectionId);
        WorkOrder workOrder = locked.workOrder();
        QualityInspection inspection = locked.inspection();
        User actor = requireAssignedActor(currentUserId, inspection);
        requireOpenInspection(workOrder, inspection);

        List<QualityCheck> checks = checkRepository
                .findAllByQualityInspection_IdOrderByIdAsc(inspectionId);

        if (checks.isEmpty()) {
            conflict("La inspección necesita al menos un control antes de finalizarse.");
        }

        long failedChecks = checks.stream()
                .filter(qualityCheck -> qualityCheck.getResult() == QualityCheckResult.FAIL)
                .count();

        QualityInspectionStatus previousStatus = inspection.getStatus();
        WorkOrderStatus previousWorkOrderStatus = workOrder.getStatus();
        Instant completedAt = Instant.now();

        NonConformity reworkNonConformity = null;
        if (inspection.getReworkNonConformity() != null) {
            reworkNonConformity = nonConformityRepository
                    .findByIdForUpdate(inspection.getReworkNonConformity().getId())
                    .orElseThrow(() -> notFound(
                            "No se encontró la no conformidad ligada a la reinspección."
                    ));
        }

        NonConformity resultNonConformity = reworkNonConformity;

        if (failedChecks > 0
                && reworkNonConformity == null
                && nonConformityRepository.existsByQualityInspection_Id(inspectionId)) {
            conflict("La inspección ya tiene una no conformidad asociada.");
        }

        try {
            if (failedChecks == 0) {
                inspection.approve(completedAt);
                workOrder.approveQuality();

                if (reworkNonConformity != null) {
                    reworkNonConformity.closeAfterApprovedReinspection(
                            actor,
                            completedAt
                    );
                }
            } else {
                inspection.reject(completedAt);
                workOrder.holdForQuality();

                if (reworkNonConformity == null) {
                    resultNonConformity = NonConformity.open(
                            nonConformityReferenceGenerator.nextNumber(),
                            workOrder,
                            inspection,
                            actor,
                            completedAt
                    );
                    resultNonConformity = nonConformityRepository
                            .saveAndFlush(resultNonConformity);
                }
            }
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        inspection = inspectionRepository.saveAndFlush(inspection);
        workOrderRepository.saveAndFlush(workOrder);

        if (reworkNonConformity != null) {
            resultNonConformity = nonConformityRepository
                    .saveAndFlush(reworkNonConformity);
        }

        TraceabilityEventType resultEvent =
                inspection.getStatus() == QualityInspectionStatus.APPROVED
                        ? TraceabilityEventType.QUALITY_INSPECTION_APPROVED
                        : TraceabilityEventType.QUALITY_INSPECTION_REJECTED;

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.QUALITY_INSPECTION,
                inspection.getId(),
                resultEvent,
                previousStatus.name(),
                inspection.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderId", workOrder.getId(),
                        "workOrderStatus", workOrder.getStatus().name(),
                        "checkCount", checks.size(),
                        "failedChecks", failedChecks,
                        "reworkNonConformityId",
                        reworkNonConformity == null
                                ? null
                                : reworkNonConformity.getId()
                )
        );

        TraceabilityEventType workOrderResultEvent =
                inspection.getStatus() == QualityInspectionStatus.APPROVED
                        ? TraceabilityEventType.WORK_ORDER_QUALITY_APPROVED
                        : TraceabilityEventType.WORK_ORDER_QUALITY_REJECTED;

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.WORK_ORDER,
                workOrder.getId(),
                workOrderResultEvent,
                previousWorkOrderStatus.name(),
                workOrder.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "qualityInspectionId", inspection.getId(),
                        "nonConformityId",
                        resultNonConformity == null
                                ? null
                                : resultNonConformity.getId()
                )
        );

        if (reworkNonConformity == null && resultNonConformity != null) {
            traceabilityService.record(
                    workOrder.getJobCase(),
                    TraceabilityAggregateType.NON_CONFORMITY,
                    resultNonConformity.getId(),
                    TraceabilityEventType.NON_CONFORMITY_OPENED,
                    null,
                    resultNonConformity.getStatus().name(),
                    currentUserId,
                    metadata(
                            "number", resultNonConformity.getNonConformityNumber(),
                            "workOrderId", workOrder.getId(),
                            "qualityInspectionId", inspection.getId()
                    )
            );
        }

        if (reworkNonConformity != null) {
            if (inspection.getStatus() == QualityInspectionStatus.APPROVED) {
                traceabilityService.record(
                        workOrder.getJobCase(),
                        TraceabilityAggregateType.NON_CONFORMITY,
                        reworkNonConformity.getId(),
                        TraceabilityEventType.NON_CONFORMITY_CLOSED,
                        com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus.OPEN.name(),
                        reworkNonConformity.getStatus().name(),
                        currentUserId,
                        metadata(
                                "disposition", reworkNonConformity.getDisposition(),
                                "qualityInspectionId", inspection.getId(),
                                "resolvedByUserId", actor.getId()
                        )
                );

                traceabilityService.record(
                        workOrder.getJobCase(),
                        TraceabilityAggregateType.WORK_ORDER,
                        workOrder.getId(),
                        TraceabilityEventType.WORK_ORDER_NC_RESOLVED,
                        previousWorkOrderStatus.name(),
                        workOrder.getStatus().name(),
                        currentUserId,
                        metadata(
                                "nonConformityId", reworkNonConformity.getId(),
                                "disposition", reworkNonConformity.getDisposition(),
                                "qualityInspectionId", inspection.getId()
                        )
                );
            } else {
                traceabilityService.record(
                        workOrder.getJobCase(),
                        TraceabilityAggregateType.NON_CONFORMITY,
                        reworkNonConformity.getId(),
                        TraceabilityEventType.REWORK_REINSPECTION_FAILED,
                        reworkNonConformity.getStatus().name(),
                        reworkNonConformity.getStatus().name(),
                        currentUserId,
                        metadata(
                                "qualityInspectionId", inspection.getId(),
                                "failedChecks", failedChecks
                        )
                );
            }
        }

        return QualityInspectionResponse.from(
                inspection,
                checks,
                resultNonConformity
        );
    }

    @Transactional(readOnly = true)
    public List<QualityInspectionResponse> list(Long currentUserId, Long workOrderId) {
        accessPolicy.requireInternalReader(currentUserId);

        if (!workOrderRepository.existsById(workOrderId)) {
            throw notFound("No se encontró la orden de trabajo.");
        }

        return inspectionRepository
                .findAllByWorkOrder_IdOrderByCreatedAtAscIdAsc(workOrderId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public QualityInspectionResponse get(Long currentUserId, Long inspectionId) {
        accessPolicy.requireInternalReader(currentUserId);

        QualityInspection inspection = inspectionRepository.findById(inspectionId)
                .orElseThrow(() -> notFound("No se encontró la inspección de Calidad."));

        return toResponse(inspection);
    }

    private LockedInspection lockWorkOrderThenInspection(Long inspectionId) {
        Long workOrderId = inspectionRepository.findWorkOrderIdById(inspectionId)
                .orElseThrow(() -> notFound("No se encontró la inspección de Calidad."));

        WorkOrder workOrder = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));

        QualityInspection inspection = inspectionRepository
                .findByIdForUpdate(inspectionId)
                .orElseThrow(() -> notFound("No se encontró la inspección de Calidad."));

        if (!inspection.getWorkOrder().getId().equals(workOrder.getId())) {
            conflict("La inspección ya no pertenece a la orden de trabajo esperada.");
        }

        return new LockedInspection(workOrder, inspection);
    }

    private User requireAssignedActor(
            Long currentUserId,
            QualityInspection inspection
    ) {
        Long inspectorId = inspection.getInspector() == null
                ? null
                : inspection.getInspector().getId();

        return accessPolicy.requireAssignedQualityActor(
                currentUserId,
                inspectorId
        );
    }

    private void requireOpenInspection(
            WorkOrder workOrder,
            QualityInspection inspection
    ) {
        if (workOrder.getStatus() != WorkOrderStatus.QUALITY_PENDING) {
            conflict("La orden debe estar QUALITY_PENDING para modificar la inspección.");
        }
        if (inspection.getStatus() != QualityInspectionStatus.IN_PROGRESS) {
            conflict("La inspección debe estar IN_PROGRESS.");
        }
    }

    private QualityInspectionResponse toResponse(QualityInspection inspection) {
        List<QualityCheck> checks = checkRepository
                .findAllByQualityInspection_IdOrderByIdAsc(inspection.getId());

        NonConformity nonConformity = inspection.getReworkNonConformity();

        if (nonConformity == null) {
            nonConformity = nonConformityRepository
                    .findByQualityInspection_Id(inspection.getId())
                    .orElse(null);
        }

        return QualityInspectionResponse.from(
                inspection,
                checks,
                nonConformity
        );
    }

    private QualityCheck createCheck(
            QualityInspection inspection,
            SaveQualityCheckRequest request
    ) {
        validateCheckRequest(request);

        if (request.type() == QualityCheckType.NUMERIC_RANGE) {
            return QualityCheck.createNumericRange(
                    inspection,
                    request.name(),
                    request.nominalValue(),
                    request.lowerLimit(),
                    request.upperLimit(),
                    request.measuredValue(),
                    request.unit(),
                    request.notes()
            );
        }

        return QualityCheck.createPassFail(
                inspection,
                request.name(),
                request.result(),
                request.notes()
        );
    }

    private void updateCheck(
            QualityCheck qualityCheck,
            SaveQualityCheckRequest request
    ) {
        validateCheckRequest(request);

        if (request.type() == QualityCheckType.NUMERIC_RANGE) {
            qualityCheck.updateNumericRange(
                    request.name(),
                    request.nominalValue(),
                    request.lowerLimit(),
                    request.upperLimit(),
                    request.measuredValue(),
                    request.unit(),
                    request.notes()
            );
            return;
        }

        qualityCheck.updatePassFail(
                request.name(),
                request.result(),
                request.notes()
        );
    }

    private void validateCheckRequest(SaveQualityCheckRequest request) {
        if (request.type() == QualityCheckType.NUMERIC_RANGE) {
            if (request.nominalValue() == null
                    || request.lowerLimit() == null
                    || request.upperLimit() == null
                    || request.measuredValue() == null
                    || request.unit() == null
                    || request.unit().isBlank()) {
                throw new IllegalArgumentException(
                        "Un control NUMERIC_RANGE requiere nominal, límites, valor medido y unidad."
                );
            }
            if (request.result() != null) {
                throw new IllegalArgumentException(
                        "El resultado de un control NUMERIC_RANGE se calcula en backend."
                );
            }
            return;
        }

        if (request.result() == null) {
            throw new IllegalArgumentException(
                    "Un control PASS_FAIL requiere un resultado PASS o FAIL."
            );
        }

        if (request.nominalValue() != null
                || request.lowerLimit() != null
                || request.upperLimit() != null
                || request.measuredValue() != null
                || (request.unit() != null && !request.unit().isBlank())) {
            throw new IllegalArgumentException(
                    "Un control PASS_FAIL no acepta valores numéricos ni unidad."
            );
        }
    }

    private void traceCheck(
            WorkOrder workOrder,
            QualityInspection inspection,
            QualityCheck qualityCheck,
            TraceabilityEventType eventType,
            Long currentUserId,
            QualityCheckResult previousResult,
            Map<String, Object> previousCheck
    ) {
        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.QUALITY_CHECK,
                qualityCheck.getId(),
                eventType,
                previousResult == null ? null : previousResult.name(),
                qualityCheck.getResult().name(),
                currentUserId,
                metadata(
                        "qualityInspectionId", inspection.getId(),
                        "qualityCheckId", qualityCheck.getId(),
                        "checkType", qualityCheck.getType(),
                        "name", qualityCheck.getName(),
                        "nominalValue", qualityCheck.getNominalValue(),
                        "measuredValue", qualityCheck.getMeasuredValue(),
                        "lowerLimit", qualityCheck.getLowerLimit(),
                        "upperLimit", qualityCheck.getUpperLimit(),
                        "unit", qualityCheck.getUnit(),
                        "notes", qualityCheck.getNotes(),
                        "previous", previousCheck,
                        "inspectorId", inspection.getInspector().getId()
                )
        );
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

    private record LockedInspection(
            WorkOrder workOrder,
            QualityInspection inspection
    ) {
    }
}
