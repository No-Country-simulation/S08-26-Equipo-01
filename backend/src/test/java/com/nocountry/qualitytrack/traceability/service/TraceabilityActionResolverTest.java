package com.nocountry.qualitytrack.traceability.service;

import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityEventResponse;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityActionType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityResourceType;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TraceabilityActionResolverTest {

    private final TraceabilityActionResolver resolver = new TraceabilityActionResolver();

    @Test
    void documentReplacementExposesPreviousAndNewVersions() {
        TraceabilityEventResponse event = new TraceabilityEventResponse(
                100L,
                TraceabilityAggregateType.WORK_ORDER,
                7L,
                TraceabilityEventType.WORK_ORDER_DOCUMENT_PINNED,
                "CREATED",
                "CREATED",
                10L,
                "Ana López",
                Map.of(
                        "documentId", 5L,
                        "previousDocumentVersionId", 18L,
                        "previousVersion", 1,
                        "documentVersionId", 22L,
                        "version", 2
                ),
                Instant.parse("2026-09-28T18:00:00Z")
        );

        var actions = resolver.resolve(event);

        assertTrue(actions.stream().anyMatch(action ->
                action.type() == TraceabilityActionType.VIEW_WORK_ORDER
                        && action.resourceType() == TraceabilityResourceType.WORK_ORDER
                        && action.resourceId().equals(7L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.type() == TraceabilityActionType.VIEW_DOCUMENT
                        && action.resourceType() == TraceabilityResourceType.DOCUMENT
                        && action.resourceId().equals(5L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.type() == TraceabilityActionType.VIEW_DOCUMENT_VERSION
                        && action.label().equals("Ver versión anterior")
                        && action.resourceType() == TraceabilityResourceType.DOCUMENT_VERSION
                        && action.resourceId().equals(18L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.type() == TraceabilityActionType.VIEW_DOCUMENT_VERSION
                        && action.label().equals("Ver versión nueva")
                        && action.resourceType() == TraceabilityResourceType.DOCUMENT_VERSION
                        && action.resourceId().equals(22L)));
    }

    @Test
    void deliveryAndQuotationMetadataExposeOriginalResources() {
        TraceabilityEventResponse deliveryEvent = new TraceabilityEventResponse(
                102L,
                TraceabilityAggregateType.DELIVERY,
                50L,
                TraceabilityEventType.DELIVERY_DELIVERED,
                "DISPATCHED",
                "DELIVERED",
                10L,
                "Ana López",
                Map.of(
                        "workOrderId", 7L,
                        "evidenceDocumentVersionId", 80L
                ),
                Instant.parse("2026-09-28T20:00:00Z")
        );

        var deliveryActions = resolver.resolve(deliveryEvent);

        assertTrue(deliveryActions.stream().anyMatch(action ->
                action.type() == TraceabilityActionType.VIEW_DOCUMENT_VERSION
                        && action.label().equals("Ver evidencia")
                        && action.resourceType() == TraceabilityResourceType.DOCUMENT_VERSION
                        && action.resourceId().equals(80L)));

        TraceabilityEventResponse quotationEvent = new TraceabilityEventResponse(
                103L,
                TraceabilityAggregateType.QUOTATION,
                22L,
                TraceabilityEventType.QUOTATION_REVISION_CREATED,
                null,
                "DRAFT",
                10L,
                "Ana López",
                Map.of(
                        "sourceQuotationId", 20L,
                        "nextQuotationId", 22L
                ),
                Instant.parse("2026-09-28T20:10:00Z")
        );

        var quotationActions = resolver.resolve(quotationEvent);

        assertTrue(quotationActions.stream().anyMatch(action ->
                action.type() == TraceabilityActionType.VIEW_QUOTATION
                        && action.label().equals("Ver cotización origen")
                        && action.resourceType() == TraceabilityResourceType.QUOTATION
                        && action.resourceId().equals(20L)));
        assertTrue(quotationActions.stream().anyMatch(action ->
                action.type() == TraceabilityActionType.VIEW_QUOTATION
                        && action.label().equals("Ver cotización")
                        && action.resourceType() == TraceabilityResourceType.QUOTATION
                        && action.resourceId().equals(22L)));
    }

    @Test
    void qualityRejectionLinksInspectionAndNonConformityWithoutDuplicates() {
        TraceabilityEventResponse event = new TraceabilityEventResponse(
                101L,
                TraceabilityAggregateType.QUALITY_INSPECTION,
                30L,
                TraceabilityEventType.QUALITY_INSPECTION_REJECTED,
                "IN_PROGRESS",
                "REJECTED",
                10L,
                "Ana López",
                Map.of(
                        "workOrderId", 7L,
                        "nonConformityId", 40L
                ),
                Instant.parse("2026-09-28T19:00:00Z")
        );

        var actions = resolver.resolve(event);

        assertEquals(3, actions.size());
        assertTrue(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.QUALITY_INSPECTION
                        && action.resourceId().equals(30L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.NON_CONFORMITY
                        && action.resourceId().equals(40L)));
    }

    @Test
    void qualityCheckEventExposesInspectionAndCheckActions() {
        TraceabilityEventResponse event = new TraceabilityEventResponse(
                106L,
                TraceabilityAggregateType.QUALITY_CHECK,
                70L,
                TraceabilityEventType.QUALITY_CHECK_RECORDED,
                null,
                "PASS",
                10L,
                "Ana López",
                Map.of(
                        "qualityInspectionId", 30L,
                        "qualityCheckId", 70L,
                        "checkType", "PASS_FAIL"
                ),
                Instant.parse("2026-09-28T19:20:00Z")
        );

        var actions = resolver.resolve(event);

        assertTrue(actions.stream().anyMatch(action ->
                action.type() == TraceabilityActionType.VIEW_QUALITY_CHECK
                        && action.resourceType() == TraceabilityResourceType.QUALITY_CHECK
                        && action.resourceId().equals(70L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.type() == TraceabilityActionType.VIEW_QUALITY_INSPECTION
                        && action.resourceType() == TraceabilityResourceType.QUALITY_INSPECTION
                        && action.resourceId().equals(30L)));
    }

    @Test
    void removedDocumentDoesNotExposeStaleDocumentAction() {
        TraceabilityEventResponse event = new TraceabilityEventResponse(
                104L,
                TraceabilityAggregateType.DOCUMENT,
                55L,
                TraceabilityEventType.DOCUMENT_REMOVED,
                null,
                null,
                10L,
                "Ana López",
                Map.of(
                        "requestId", 3L,
                        "documentName", "Plano obsoleto.pdf"
                ),
                Instant.parse("2026-09-28T21:00:00Z")
        );

        var actions = resolver.resolve(event);

        assertFalse(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.DOCUMENT
                        && action.resourceId().equals(55L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.CUSTOMER_REQUEST
                        && action.resourceId().equals(3L)));
    }

    @Test
    void removedRoutingOperationKeepsContextWithoutLinkingDeletedOperation() {
        TraceabilityEventResponse event = new TraceabilityEventResponse(
                105L,
                TraceabilityAggregateType.ROUTING_SHEET,
                60L,
                TraceabilityEventType.ROUTING_OPERATION_REMOVED,
                "DRAFT",
                "DRAFT",
                10L,
                "Ana López",
                Map.of(
                        "workOrderId", 7L,
                        "operationId", 61L,
                        "sequenceNumber", 20,
                        "code", "TURN",
                        "name", "Torneado"
                ),
                Instant.parse("2026-09-28T21:10:00Z")
        );

        var actions = resolver.resolve(event);

        assertFalse(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.ROUTING_OPERATION
                        && action.resourceId().equals(61L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.ROUTING_SHEET
                        && action.resourceId().equals(60L)));
        assertTrue(actions.stream().anyMatch(action ->
                action.resourceType() == TraceabilityResourceType.WORK_ORDER
                        && action.resourceId().equals(7L)));
    }
}
