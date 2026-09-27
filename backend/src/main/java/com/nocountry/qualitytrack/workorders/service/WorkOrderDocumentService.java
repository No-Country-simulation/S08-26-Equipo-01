package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDocumentResponse;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.entity.WorkOrderDocument;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderDocumentRepository;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkOrderDocumentService {

    private final WorkOrderDocumentRepository workOrderDocumentRepository;
    private final WorkOrderRepository workOrderRepository;
    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final WorkOrderAccessPolicy accessPolicy;
    private final TraceabilityService traceabilityService;

    @Transactional(readOnly = true)
    public List<WorkOrderDocumentResponse> listPinned(Long workOrderId) {
        return workOrderDocumentRepository
                .findAllByWorkOrder_IdOrderByLinkedAtAsc(workOrderId)
                .stream()
                .map(WorkOrderDocumentResponse::from)
                .toList();
    }

    @Transactional
    public WorkOrderDocumentResponse pin(
            Long currentUserId,
            Long workOrderId,
            Long documentId,
            Long versionId
    ) {
        User actor = accessPolicy.requirePlanningActor(currentUserId);

        WorkOrder workOrder = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> notFound("No se encontró la orden de trabajo."));

        if (workOrder.getStatus() != WorkOrderStatus.CREATED) {
            conflict("Los documentos solo pueden fijarse mientras la orden está en CREATED.");
        }

        Long caseId = workOrder.getJobCase().getId();
        Document document = documentRepository
                .findByIdAndJobCase_IdAndStatus(documentId, caseId, DocumentStatus.ACTIVE)
                .orElseThrow(() -> notFound(
                        "No se encontró el documento activo dentro del expediente de la orden."
                ));

        DocumentVersion version = documentVersionRepository
                .findByIdAndDocument_IdAndDocument_JobCase_IdAndDocument_Status(
                        versionId,
                        documentId,
                        caseId,
                        DocumentStatus.ACTIVE
                )
                .orElseThrow(() -> notFound(
                        "No se encontró la versión indicada para ese documento."
                ));

        Instant now = Instant.now();
        Optional<WorkOrderDocument> existingLink = workOrderDocumentRepository
                .findByWorkOrder_IdAndDocument_Id(workOrderId, documentId);

        Long previousVersionId = null;
        Integer previousVersion = null;
        WorkOrderDocument link;

        if (existingLink.isPresent()) {
            link = existingLink.get();
            previousVersionId = link.getDocumentVersion().getId();
            previousVersion = link.getDocumentVersion().getVersion();
            link.rebind(version, actor, now);
        } else {
            link = WorkOrderDocument.pin(
                    workOrder,
                    document,
                    version,
                    actor,
                    now
            );
        }

        link = workOrderDocumentRepository.saveAndFlush(link);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.WORK_ORDER,
                workOrder.getId(),
                TraceabilityEventType.WORK_ORDER_DOCUMENT_PINNED,
                workOrder.getStatus().name(),
                workOrder.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "documentId", document.getId(),
                        "documentName", document.getName(),
                        "changeType", existingLink.isPresent() ? "REPLACED" : "PINNED",
                        "previousDocumentVersionId", previousVersionId,
                        "previousVersion", previousVersion,
                        "documentVersionId", version.getId(),
                        "version", version.getVersion()
                )
        );

        return WorkOrderDocumentResponse.from(link);
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
}
