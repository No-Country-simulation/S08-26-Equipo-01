package com.nocountry.qualitytrack.materials.service;

import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.documents.service.DocumentAccessService;
import com.nocountry.qualitytrack.materials.dto.request.CreateMaterialLotRequest;
import com.nocountry.qualitytrack.materials.dto.request.CreateMaterialRequest;
import com.nocountry.qualitytrack.materials.dto.request.RecordMaterialConsumptionRequest;
import com.nocountry.qualitytrack.materials.dto.response.MaterialLotResponse;
import com.nocountry.qualitytrack.materials.dto.response.MaterialResponse;
import com.nocountry.qualitytrack.materials.dto.response.WorkOrderMaterialResponse;
import com.nocountry.qualitytrack.materials.entity.Material;
import com.nocountry.qualitytrack.materials.entity.MaterialLot;
import com.nocountry.qualitytrack.materials.entity.WorkOrderMaterial;
import com.nocountry.qualitytrack.materials.repository.MaterialLotRepository;
import com.nocountry.qualitytrack.materials.repository.MaterialRepository;
import com.nocountry.qualitytrack.materials.repository.WorkOrderMaterialRepository;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MaterialService {

    private static final String MATERIAL_CERTIFICATE_TYPE = "MATERIAL_CERTIFICATE";

    private final MaterialRepository materialRepository;
    private final MaterialLotRepository materialLotRepository;
    private final WorkOrderMaterialRepository workOrderMaterialRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final DocumentAccessService documentAccessService;
    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderAccessPolicy accessPolicy;
    private final TraceabilityService traceabilityService;

    @Transactional
    public MaterialResponse createMaterial(Long currentUserId, CreateMaterialRequest request) {
        accessPolicy.requireProductionActor(currentUserId);

        if (materialRepository.existsByCodeIgnoreCase(request.code())) {
            conflict("Ya existe un material con ese código.");
        }

        Material material;
        try {
            material = Material.create(
                    request.code(),
                    request.name(),
                    request.specification(),
                    request.unit()
            );
        } catch (IllegalArgumentException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        return MaterialResponse.from(materialRepository.saveAndFlush(material));
    }

    @Transactional(readOnly = true)
    public List<MaterialResponse> listMaterials(Long currentUserId) {
        accessPolicy.requireInternalReader(currentUserId);
        return materialRepository.findAll()
                .stream()
                .map(MaterialResponse::from)
                .toList();
    }

    @Transactional
    public MaterialLotResponse createLot(
            Long currentUserId,
            Long materialId,
            CreateMaterialLotRequest request
    ) {
        accessPolicy.requireProductionActor(currentUserId);

        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> notFound("No se encontró el material."));

        if (materialLotRepository.existsByMaterial_IdAndLotNumberIgnoreCase(
                materialId,
                request.lotNumber()
        )) {
            conflict("Ya existe ese número de lote para el material.");
        }

        DocumentVersion certificateVersion = request.certificateDocumentVersionId() == null
                ? null
                : requireMaterialCertificate(
                        currentUserId,
                        request.certificateDocumentVersionId()
                );

        MaterialLot lot;
        try {
            lot = MaterialLot.create(
                    material,
                    request.lotNumber(),
                    request.supplier(),
                    request.receivedAt() == null ? Instant.now() : request.receivedAt(),
                    request.quantityReceived(),
                    certificateVersion
            );
        } catch (IllegalArgumentException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        return MaterialLotResponse.from(materialLotRepository.saveAndFlush(lot));
    }

    @Transactional(readOnly = true)
    public List<MaterialLotResponse> listLots(Long currentUserId, Long materialId) {
        accessPolicy.requireInternalReader(currentUserId);

        if (!materialRepository.existsById(materialId)) {
            throw notFound("No se encontró el material.");
        }

        return materialLotRepository.findAllByMaterial_IdOrderByReceivedAtDesc(materialId)
                .stream()
                .map(MaterialLotResponse::from)
                .toList();
    }

    @Transactional
    public WorkOrderMaterialResponse recordConsumption(
            Long currentUserId,
            Long workOrderId,
            RecordMaterialConsumptionRequest request
    ) {
        User actor = accessPolicy.requireProductionActor(currentUserId);

        WorkOrder workOrder = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));

        boolean productionOpen =
                workOrder.getStatus() == WorkOrderStatus.IN_PRODUCTION
                        && !workOrder.isProductionCompleted();
        boolean reworkOpen =
                workOrder.getStatus() == WorkOrderStatus.REWORK_IN_PROGRESS;

        if (!productionOpen && !reworkOpen) {
            conflict(
                    "El consumo real solo puede registrarse durante producción o retrabajo en ejecución."
            );
        }

        MaterialLot lot = materialLotRepository.findByIdForUpdate(request.materialLotId())
                .orElseThrow(() -> notFound("No se encontró el lote de material."));

        BigDecimal alreadyUsed = workOrderMaterialRepository
                .sumQuantityUsedByMaterialLotId(lot.getId());
        BigDecimal projected = alreadyUsed.add(request.quantityUsed());

        if (projected.compareTo(lot.getQuantityReceived()) > 0) {
            conflict("La cantidad solicitada supera la cantidad disponible del lote.");
        }

        Instant recordedAt = Instant.now();
        WorkOrderMaterial consumption = workOrderMaterialRepository
                .findByWorkOrderAndLotForUpdate(workOrderId, lot.getId())
                .orElse(null);

        BigDecimal previousQuantity = consumption == null
                ? BigDecimal.ZERO
                : consumption.getQuantityUsed();

        try {
            if (consumption == null) {
                consumption = WorkOrderMaterial.create(
                        workOrder,
                        lot,
                        request.quantityUsed(),
                        actor,
                        recordedAt
                );
            } else {
                consumption.addQuantity(request.quantityUsed(), actor, recordedAt);
            }
        } catch (IllegalArgumentException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        consumption = workOrderMaterialRepository.saveAndFlush(consumption);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.WORK_ORDER,
                workOrder.getId(),
                TraceabilityEventType.WORK_ORDER_MATERIAL_RECORDED,
                workOrder.getStatus().name(),
                workOrder.getStatus().name(),
                currentUserId,
                metadata(
                        "materialLotId", lot.getId(),
                        "materialId", lot.getMaterial().getId(),
                        "materialCode", lot.getMaterial().getCode(),
                        "lotNumber", lot.getLotNumber(),
                        "quantityAdded", request.quantityUsed(),
                        "previousQuantityUsed", previousQuantity,
                        "quantityUsed", consumption.getQuantityUsed(),
                        "unit", lot.getMaterial().getUnit()
                )
        );

        return WorkOrderMaterialResponse.from(consumption);
    }

    @Transactional(readOnly = true)
    public List<WorkOrderMaterialResponse> listConsumption(
            Long currentUserId,
            Long workOrderId
    ) {
        accessPolicy.requireInternalReader(currentUserId);

        if (!workOrderRepository.existsById(workOrderId)) {
            throw notFound("No se encontró la orden de trabajo.");
        }

        return workOrderMaterialRepository
                .findAllByWorkOrder_IdOrderByRecordedAtAsc(workOrderId)
                .stream()
                .map(WorkOrderMaterialResponse::from)
                .toList();
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

    private DocumentVersion requireMaterialCertificate(
            Long currentUserId,
            Long documentVersionId
    ) {
        DocumentVersion version = documentVersionRepository
                .findByIdAndDocument_Status(
                        documentVersionId,
                        DocumentStatus.ACTIVE
                )
                .orElseThrow(() -> notFound(
                        "No se encontró una versión documental activa para el certificado."
                ));

        if (!MATERIAL_CERTIFICATE_TYPE.equals(version.getDocument().getDocumentType())) {
            conflict(
                    "La versión documental del lote debe pertenecer a un documento MATERIAL_CERTIFICATE."
            );
        }

        documentAccessService.requireCanReadVersion(currentUserId, version);
        return version;
    }

    private BusinessException notFound(String message) {
        return new BusinessException(ApiErrorCode.RESOURCE_NOT_FOUND, message);
    }

    private void conflict(String message) {
        throw new BusinessException(ApiErrorCode.DATA_CONFLICT, message);
    }
}
