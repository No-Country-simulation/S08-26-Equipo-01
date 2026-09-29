package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.dto.response.DocumentCenterResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentReferenceResponse;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentContext;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.materials.entity.MaterialLot;
import com.nocountry.qualitytrack.materials.repository.MaterialLotRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.workorders.entity.WorkOrderDocument;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentCenterService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final WorkOrderDocumentRepository workOrderDocumentRepository;
    private final MaterialLotRepository materialLotRepository;
    private final DeliveryRepository deliveryRepository;
    private final DocumentAccessService accessService;

    @Transactional(readOnly = true)
    public List<DocumentCenterResponse> search(
            Long currentUserId,
            Long customerId,
            Long caseId,
            Long workOrderId,
            Long materialLotId,
            Long deliveryId,
            String documentType,
            DocumentContext context
    ) {
        accessService.requireInternalReader(currentUserId);

        List<Document> documents = documentRepository.searchActiveForCenter(
                DocumentStatus.ACTIVE,
                caseId,
                customerId,
                normalizeType(documentType),
                workOrderId,
                materialLotId,
                deliveryId
        );

        if (documents.isEmpty()) {
            return List.of();
        }

        List<Long> documentIds = documents.stream()
                .map(Document::getId)
                .toList();

        Map<Long, DocumentVersion> latestVersions = documentVersionRepository
                .findLatestByDocumentIds(documentIds)
                .stream()
                .collect(Collectors.toMap(
                        version -> version.getDocument().getId(),
                        Function.identity()
                ));

        Map<Long, List<WorkOrderDocument>> workOrderReferencesByDocument =
                workOrderDocumentRepository.findAllByDocumentIds(documentIds)
                        .stream()
                        .collect(Collectors.groupingBy(
                                reference -> reference.getDocument().getId(),
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        Map<Long, List<MaterialLot>> materialReferencesByDocument =
                materialLotRepository.findAllByCertificateDocumentIds(documentIds)
                        .stream()
                        .collect(Collectors.groupingBy(
                                reference -> reference.getCertificateDocumentVersion()
                                        .getDocument()
                                        .getId(),
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        Map<Long, List<Delivery>> deliveryReferencesByDocument =
                deliveryRepository.findAllByEvidenceDocumentIds(documentIds)
                        .stream()
                        .collect(Collectors.groupingBy(
                                reference -> reference.getEvidenceDocumentVersion()
                                        .getDocument()
                                        .getId(),
                                LinkedHashMap::new,
                                Collectors.toList()
                        ));

        List<DocumentCenterResponse> response = new ArrayList<>();

        for (Document document : documents) {
            List<WorkOrderDocument> workOrderReferences =
                    workOrderReferencesByDocument.getOrDefault(document.getId(), List.of());
            List<MaterialLot> materialReferences =
                    materialReferencesByDocument.getOrDefault(document.getId(), List.of());
            List<Delivery> deliveryReferences =
                    deliveryReferencesByDocument.getOrDefault(document.getId(), List.of());

            List<Long> workOrderIds = workOrderReferences.stream()
                    .map(reference -> reference.getWorkOrder().getId())
                    .toList();
            List<Long> materialLotIds = materialReferences.stream()
                    .map(MaterialLot::getId)
                    .toList();
            List<Long> deliveryIds = deliveryReferences.stream()
                    .map(Delivery::getId)
                    .toList();

            LinkedHashSet<DocumentContext> contexts = contexts(
                    workOrderIds,
                    materialLotIds,
                    deliveryIds
            );

            if (context != null && !contexts.contains(context)) {
                continue;
            }

            DocumentVersion latestVersion = latestVersions.get(document.getId());
            if (latestVersion == null) {
                throw new BusinessException(
                        ApiErrorCode.DATA_CONFLICT,
                        "El documento no tiene una versión disponible."
                );
            }

            response.add(DocumentCenterResponse.from(
                    document,
                    latestVersion,
                    contexts,
                    workOrderIds,
                    materialLotIds,
                    deliveryIds,
                    references(
                            workOrderReferences,
                            materialReferences,
                            deliveryReferences
                    )
            ));
        }

        return response;
    }

    private LinkedHashSet<DocumentContext> contexts(
            List<Long> workOrderIds,
            List<Long> materialLotIds,
            List<Long> deliveryIds
    ) {
        LinkedHashSet<DocumentContext> contexts = new LinkedHashSet<>();
        contexts.add(DocumentContext.CASE);

        if (!workOrderIds.isEmpty()) {
            contexts.add(DocumentContext.WORK_ORDER);
        }
        if (!materialLotIds.isEmpty()) {
            contexts.add(DocumentContext.MATERIAL);
        }
        if (!deliveryIds.isEmpty()) {
            contexts.add(DocumentContext.DELIVERY);
        }

        return contexts;
    }

    private List<DocumentReferenceResponse> references(
            List<WorkOrderDocument> workOrderReferences,
            List<MaterialLot> materialReferences,
            List<Delivery> deliveryReferences
    ) {
        List<DocumentReferenceResponse> references = new ArrayList<>();

        for (WorkOrderDocument reference : workOrderReferences) {
            DocumentVersion version = reference.getDocumentVersion();
            references.add(new DocumentReferenceResponse(
                    DocumentContext.WORK_ORDER,
                    reference.getWorkOrder().getId(),
                    version.getId(),
                    version.getVersion()
            ));
        }

        for (MaterialLot reference : materialReferences) {
            DocumentVersion version = reference.getCertificateDocumentVersion();
            references.add(new DocumentReferenceResponse(
                    DocumentContext.MATERIAL,
                    reference.getId(),
                    version.getId(),
                    version.getVersion()
            ));
        }

        for (Delivery reference : deliveryReferences) {
            DocumentVersion version = reference.getEvidenceDocumentVersion();
            references.add(new DocumentReferenceResponse(
                    DocumentContext.DELIVERY,
                    reference.getId(),
                    version.getId(),
                    version.getVersion()
            ));
        }

        return references;
    }

    private String normalizeType(String documentType) {
        if (documentType == null || documentType.isBlank()) {
            return null;
        }
        return documentType.trim().toUpperCase(Locale.ROOT);
    }
}
