package com.nocountry.qualitytrack.quality.service;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.repository.NonConformityRepository;
import com.nocountry.qualitytrack.nonconformities.service.NonConformityReferenceGenerator;
import com.nocountry.qualitytrack.quality.dto.request.SaveQualityMeasurementRequest;
import com.nocountry.qualitytrack.quality.dto.request.StartQualityInspectionRequest;
import com.nocountry.qualitytrack.quality.dto.response.QualityInspectionResponse;
import com.nocountry.qualitytrack.quality.dto.response.QualityMeasurementResponse;
import com.nocountry.qualitytrack.quality.entity.QualityInspection;
import com.nocountry.qualitytrack.quality.entity.QualityMeasurement;
import com.nocountry.qualitytrack.quality.enums.QualityInspectionStatus;
import com.nocountry.qualitytrack.quality.enums.QualityMeasurementResult;
import com.nocountry.qualitytrack.quality.repository.QualityInspectionRepository;
import com.nocountry.qualitytrack.quality.repository.QualityMeasurementRepository;
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
    private final QualityMeasurementRepository measurementRepository;
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
    public QualityMeasurementResponse addMeasurement(
            Long currentUserId,
            Long inspectionId,
            SaveQualityMeasurementRequest request
    ) {
        accessPolicy.requireQualityActor(currentUserId);
        LockedInspection locked = lockWorkOrderThenInspection(inspectionId);
        WorkOrder workOrder = locked.workOrder();
        QualityInspection inspection = locked.inspection();
        requireAssignedActor(currentUserId, inspection);
        requireOpenInspection(workOrder, inspection);

        QualityMeasurement measurement;
        try {
            measurement = QualityMeasurement.create(
                    inspection,
                    request.characteristic(),
                    request.nominalValue(),
                    request.lowerLimit(),
                    request.upperLimit(),
                    request.measuredValue(),
                    request.unit(),
                    request.notes()
            );
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        measurement = measurementRepository.saveAndFlush(measurement);

        traceMeasurement(
                workOrder,
                inspection,
                measurement,
                TraceabilityEventType.QUALITY_MEASUREMENT_RECORDED,
                currentUserId,
                null,
                null
        );

        return QualityMeasurementResponse.from(measurement);
    }

    @Transactional
    public QualityMeasurementResponse updateMeasurement(
            Long currentUserId,
            Long inspectionId,
            Long measurementId,
            SaveQualityMeasurementRequest request
    ) {
        accessPolicy.requireQualityActor(currentUserId);

        Long measurementInspectionId = measurementRepository
                .findInspectionIdById(measurementId)
                .orElseThrow(() -> notFound("No se encontró la medición."));

        if (!inspectionId.equals(measurementInspectionId)) {
            conflict("La medición no pertenece a la inspección indicada.");
        }

        LockedInspection locked = lockWorkOrderThenInspection(inspectionId);
        WorkOrder workOrder = locked.workOrder();
        QualityInspection inspection = locked.inspection();
        requireAssignedActor(currentUserId, inspection);
        requireOpenInspection(workOrder, inspection);

        QualityMeasurement measurement = measurementRepository
                .findByIdForUpdate(measurementId)
                .orElseThrow(() -> notFound("No se encontró la medición."));

        QualityMeasurementResult previousResult = measurement.getResult();
        Map<String, Object> previousMeasurement = metadata(
                "characteristic", measurement.getCharacteristic(),
                "nominalValue", measurement.getNominalValue(),
                "lowerLimit", measurement.getLowerLimit(),
                "upperLimit", measurement.getUpperLimit(),
                "measuredValue", measurement.getMeasuredValue(),
                "unit", measurement.getUnit(),
                "notes", measurement.getNotes()
        );

        try {
            measurement.update(
                    request.characteristic(),
                    request.nominalValue(),
                    request.lowerLimit(),
                    request.upperLimit(),
                    request.measuredValue(),
                    request.unit(),
                    request.notes()
            );
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        measurement = measurementRepository.saveAndFlush(measurement);

        traceMeasurement(
                workOrder,
                inspection,
                measurement,
                TraceabilityEventType.QUALITY_MEASUREMENT_UPDATED,
                currentUserId,
                previousResult,
                previousMeasurement
        );

        return QualityMeasurementResponse.from(measurement);
    }

    @Transactional
    public QualityInspectionResponse complete(Long currentUserId, Long inspectionId) {
        accessPolicy.requireQualityActor(currentUserId);
        LockedInspection locked = lockWorkOrderThenInspection(inspectionId);
        WorkOrder workOrder = locked.workOrder();
        QualityInspection inspection = locked.inspection();
        User actor = requireAssignedActor(currentUserId, inspection);
        requireOpenInspection(workOrder, inspection);

        List<QualityMeasurement> measurements = measurementRepository
                .findAllByQualityInspection_IdOrderByIdAsc(inspectionId);

        if (measurements.isEmpty()) {
            conflict("La inspección necesita al menos una medición antes de finalizarse.");
        }

        long failedMeasurements = measurements.stream()
                .filter(measurement -> measurement.getResult() == QualityMeasurementResult.FAIL)
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

        if (failedMeasurements > 0
                && reworkNonConformity == null
                && nonConformityRepository.existsByQualityInspection_Id(inspectionId)) {
            conflict("La inspección ya tiene una no conformidad asociada.");
        }

        try {
            if (failedMeasurements == 0) {
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
                        "measurementCount", measurements.size(),
                        "failedMeasurements", failedMeasurements,
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
                                "failedMeasurements", failedMeasurements
                        )
                );
            }
        }

        return QualityInspectionResponse.from(
                inspection,
                measurements,
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
        List<QualityMeasurement> measurements = measurementRepository
                .findAllByQualityInspection_IdOrderByIdAsc(inspection.getId());

        NonConformity nonConformity = inspection.getReworkNonConformity();

        if (nonConformity == null) {
            nonConformity = nonConformityRepository
                    .findByQualityInspection_Id(inspection.getId())
                    .orElse(null);
        }

        return QualityInspectionResponse.from(
                inspection,
                measurements,
                nonConformity
        );
    }

    private void traceMeasurement(
            WorkOrder workOrder,
            QualityInspection inspection,
            QualityMeasurement measurement,
            TraceabilityEventType eventType,
            Long currentUserId,
            QualityMeasurementResult previousResult,
            Map<String, Object> previousMeasurement
    ) {
        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.QUALITY_MEASUREMENT,
                measurement.getId(),
                eventType,
                previousResult == null ? null : previousResult.name(),
                measurement.getResult().name(),
                currentUserId,
                metadata(
                        "qualityInspectionId", inspection.getId(),
                        "characteristic", measurement.getCharacteristic(),
                        "nominalValue", measurement.getNominalValue(),
                        "measuredValue", measurement.getMeasuredValue(),
                        "lowerLimit", measurement.getLowerLimit(),
                        "upperLimit", measurement.getUpperLimit(),
                        "unit", measurement.getUnit(),
                        "notes", measurement.getNotes(),
                        "previous", previousMeasurement,
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
