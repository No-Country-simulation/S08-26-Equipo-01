package com.nocountry.qualitytrack.workorders.dto.response;

import com.nocountry.qualitytrack.deliveries.dto.response.DeliveryResponse;
import com.nocountry.qualitytrack.nonconformities.dto.response.NonConformityResponse;
import com.nocountry.qualitytrack.production.dto.response.ProductionStatusResponse;
import com.nocountry.qualitytrack.quality.dto.response.QualityInspectionResponse;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationResponse;
import com.nocountry.qualitytrack.routing.dto.response.RoutingSheetResponse;
import com.nocountry.qualitytrack.traceability.dto.response.Traceability360EventResponse;

import java.util.List;

public record WorkOrder360Response(
        WorkOrderDetailResponse workOrder,
        List<QuotationResponse> quotationRevisions,
        List<RoutingSheetResponse> routingSheets,
        ProductionStatusResponse production,
        List<WorkOrder360MaterialResponse> materials,
        List<QualityInspectionResponse> qualityInspections,
        List<NonConformityResponse> nonConformities,
        List<WorkOrder360DocumentResponse> documents,
        List<DeliveryResponse> deliveries,
        List<Traceability360EventResponse> timeline
) {
    public WorkOrder360Response {
        quotationRevisions = copy(quotationRevisions);
        routingSheets = copy(routingSheets);
        materials = copy(materials);
        qualityInspections = copy(qualityInspections);
        nonConformities = copy(nonConformities);
        documents = copy(documents);
        deliveries = copy(deliveries);
        timeline = copy(timeline);
    }

    private static <T> List<T> copy(List<T> values) {
        return values == null ? List.of() : List.copyOf(values);
    }
}
