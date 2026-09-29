package com.nocountry.qualitytrack.traceability.service;

import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityActionResponse;
import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityEventResponse;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityActionType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityResourceType;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TraceabilityActionResolver {

    public List<TraceabilityActionResponse> resolve(TraceabilityEventResponse event) {
        LinkedHashMap<String, TraceabilityActionResponse> actions = new LinkedHashMap<>();

        addAggregateAction(actions, event);

        Map<String, Object> metadata = event.metadata();
        if (metadata == null || metadata.isEmpty()) {
            return List.copyOf(actions.values());
        }

        addMetadataAction(actions, event, metadata, "requestId", "Ver solicitud",
                TraceabilityResourceType.CUSTOMER_REQUEST);
        addMetadataAction(actions, event, metadata, "caseId", "Ver expediente",
                TraceabilityResourceType.JOB_CASE);
        addMetadataAction(actions, event, metadata, "quotationId", "Ver cotización",
                TraceabilityResourceType.QUOTATION);
        addMetadataAction(actions, event, metadata, "sourceQuotationId", "Ver cotización origen",
                TraceabilityResourceType.QUOTATION);
        addMetadataAction(actions, event, metadata, "nextQuotationId", "Ver nueva revisión",
                TraceabilityResourceType.QUOTATION);
        addMetadataAction(actions, event, metadata, "workOrderId", "Ver orden de trabajo",
                TraceabilityResourceType.WORK_ORDER);
        addMetadataAction(actions, event, metadata, "routingSheetId", "Ver hoja de ruta",
                TraceabilityResourceType.ROUTING_SHEET);
        addMetadataAction(actions, event, metadata, "operationId", "Ver operación",
                TraceabilityResourceType.ROUTING_OPERATION);
        addMetadataAction(actions, event, metadata, "executionId", "Ver ejecución",
                TraceabilityResourceType.OPERATION_EXECUTION);
        addMetadataAction(actions, event, metadata, "operationExecutionId", "Ver ejecución",
                TraceabilityResourceType.OPERATION_EXECUTION);
        addMetadataAction(actions, event, metadata, "documentId", "Ver documento",
                TraceabilityResourceType.DOCUMENT);

        Long previousVersionId = asLong(metadata.get("previousDocumentVersionId"));
        if (previousVersionId != null) {
            add(actions, "Ver versión anterior",
                    TraceabilityResourceType.DOCUMENT_VERSION, previousVersionId);
        }

        Long documentVersionId = asLong(metadata.get("documentVersionId"));
        if (documentVersionId != null) {
            add(actions,
                    previousVersionId == null ? "Ver versión" : "Ver versión nueva",
                    TraceabilityResourceType.DOCUMENT_VERSION,
                    documentVersionId);
        }

        addMetadataAction(actions, event, metadata, "evidenceDocumentVersionId", "Ver evidencia",
                TraceabilityResourceType.DOCUMENT_VERSION);
        addMetadataAction(actions, event, metadata, "materialLotId", "Ver lote",
                TraceabilityResourceType.MATERIAL_LOT);
        addMetadataAction(actions, event, metadata, "qualityInspectionId", "Ver inspección",
                TraceabilityResourceType.QUALITY_INSPECTION);
        addMetadataAction(actions, event, metadata, "measurementId", "Ver medición",
                TraceabilityResourceType.QUALITY_MEASUREMENT);
        addMetadataAction(actions, event, metadata, "nonConformityId", "Ver no conformidad",
                TraceabilityResourceType.NON_CONFORMITY);
        addMetadataAction(actions, event, metadata, "reworkNonConformityId", "Ver NC de retrabajo",
                TraceabilityResourceType.NON_CONFORMITY);
        addMetadataAction(actions, event, metadata, "deliveryId", "Ver entrega",
                TraceabilityResourceType.DELIVERY);

        return new ArrayList<>(actions.values());
    }

    private void addAggregateAction(
            LinkedHashMap<String, TraceabilityActionResponse> actions,
            TraceabilityEventResponse event
    ) {
        TraceabilityAggregateType aggregateType = event.aggregateType();
        Long aggregateId = event.aggregateId();

        if (aggregateType == null || aggregateId == null || !aggregateIsNavigable(event)) {
            return;
        }

        switch (aggregateType) {
            case CUSTOMER_REQUEST -> add(actions, "Ver solicitud",
                    TraceabilityResourceType.CUSTOMER_REQUEST, aggregateId);
            case JOB_CASE -> add(actions, "Ver expediente",
                    TraceabilityResourceType.JOB_CASE, aggregateId);
            case DOCUMENT -> add(actions, "Ver documento",
                    TraceabilityResourceType.DOCUMENT, aggregateId);
            case DOCUMENT_VERSION -> add(actions, "Ver versión",
                    TraceabilityResourceType.DOCUMENT_VERSION, aggregateId);
            case QUOTATION -> add(actions, "Ver cotización",
                    TraceabilityResourceType.QUOTATION, aggregateId);
            case WORK_ORDER -> add(actions, "Ver orden de trabajo",
                    TraceabilityResourceType.WORK_ORDER, aggregateId);
            case ROUTING_SHEET -> add(actions, "Ver hoja de ruta",
                    TraceabilityResourceType.ROUTING_SHEET, aggregateId);
            case OPERATION_EXECUTION -> add(actions, "Ver ejecución",
                    TraceabilityResourceType.OPERATION_EXECUTION, aggregateId);
            case QUALITY_INSPECTION -> add(actions, "Ver inspección",
                    TraceabilityResourceType.QUALITY_INSPECTION, aggregateId);
            case QUALITY_MEASUREMENT -> add(actions, "Ver medición",
                    TraceabilityResourceType.QUALITY_MEASUREMENT, aggregateId);
            case NON_CONFORMITY -> add(actions, "Ver no conformidad",
                    TraceabilityResourceType.NON_CONFORMITY, aggregateId);
            case DELIVERY -> add(actions, "Ver entrega",
                    TraceabilityResourceType.DELIVERY, aggregateId);
        }
    }

    private boolean aggregateIsNavigable(TraceabilityEventResponse event) {
        return !(event.eventType() == TraceabilityEventType.DOCUMENT_REMOVED
                && event.aggregateType() == TraceabilityAggregateType.DOCUMENT);
    }

    private boolean metadataResourceIsNavigable(
            TraceabilityEventResponse event,
            String metadataKey
    ) {
        return !(event.eventType() == TraceabilityEventType.ROUTING_OPERATION_REMOVED
                && "operationId".equals(metadataKey));
    }

    private void addMetadataAction(
            LinkedHashMap<String, TraceabilityActionResponse> actions,
            TraceabilityEventResponse event,
            Map<String, Object> metadata,
            String key,
            String label,
            TraceabilityResourceType resourceType
    ) {
        if (!metadataResourceIsNavigable(event, key)) {
            return;
        }

        Long resourceId = asLong(metadata.get(key));
        if (resourceId != null) {
            add(actions, label, resourceType, resourceId);
        }
    }

    private void add(
            LinkedHashMap<String, TraceabilityActionResponse> actions,
            String label,
            TraceabilityResourceType resourceType,
            Long resourceId
    ) {
        if (resourceId == null) {
            return;
        }

        String key = resourceType.name() + ":" + resourceId;
        actions.putIfAbsent(
                key,
                new TraceabilityActionResponse(
                        actionTypeFor(resourceType),
                        label,
                        resourceType,
                        resourceId
                )
        );
    }

    private TraceabilityActionType actionTypeFor(TraceabilityResourceType resourceType) {
        return switch (resourceType) {
            case CUSTOMER_REQUEST -> TraceabilityActionType.VIEW_CUSTOMER_REQUEST;
            case JOB_CASE -> TraceabilityActionType.VIEW_JOB_CASE;
            case QUOTATION -> TraceabilityActionType.VIEW_QUOTATION;
            case WORK_ORDER -> TraceabilityActionType.VIEW_WORK_ORDER;
            case ROUTING_SHEET -> TraceabilityActionType.VIEW_ROUTING_SHEET;
            case ROUTING_OPERATION -> TraceabilityActionType.VIEW_ROUTING_OPERATION;
            case OPERATION_EXECUTION -> TraceabilityActionType.VIEW_OPERATION_EXECUTION;
            case DOCUMENT -> TraceabilityActionType.VIEW_DOCUMENT;
            case DOCUMENT_VERSION -> TraceabilityActionType.VIEW_DOCUMENT_VERSION;
            case MATERIAL_LOT -> TraceabilityActionType.VIEW_MATERIAL_LOT;
            case QUALITY_INSPECTION -> TraceabilityActionType.VIEW_QUALITY_INSPECTION;
            case QUALITY_MEASUREMENT -> TraceabilityActionType.VIEW_QUALITY_MEASUREMENT;
            case NON_CONFORMITY -> TraceabilityActionType.VIEW_NON_CONFORMITY;
            case DELIVERY -> TraceabilityActionType.VIEW_DELIVERY;
        };
    }

    private Long asLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String string && !string.isBlank()) {
            try {
                return Long.valueOf(string);
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }
}
