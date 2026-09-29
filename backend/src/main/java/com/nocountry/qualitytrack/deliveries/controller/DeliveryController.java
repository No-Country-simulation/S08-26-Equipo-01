package com.nocountry.qualitytrack.deliveries.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.deliveries.documentation.DeliveryApiDocs;
import com.nocountry.qualitytrack.deliveries.dto.request.AttachDeliveryEvidenceRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.CancelDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.CompleteDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.DispatchDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.response.DeliveryResponse;
import com.nocountry.qualitytrack.deliveries.service.DeliveryService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
@DeliveryApiDocs
public class DeliveryController {

    private final DeliveryService deliveryService;

    @Operation(summary = "Consultar una entrega")
    @GetMapping("/{deliveryId}")
    public ResponseEntity<ApiResponse<DeliveryResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long deliveryId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DELIVERY_RETRIEVED,
                "Entrega consultada correctamente.",
                deliveryService.get(currentUserId, deliveryId)
        ));
    }

    @Operation(summary = "Despachar una entrega PENDING")
    @PostMapping("/{deliveryId}/dispatch")
    public ResponseEntity<ApiResponse<DeliveryResponse>> dispatch(
            @CurrentUserId Long currentUserId,
            @PathVariable Long deliveryId,
            @Valid @RequestBody(required = false) DispatchDeliveryRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DELIVERY_DISPATCHED,
                "Entrega despachada correctamente.",
                deliveryService.dispatch(currentUserId, deliveryId, request)
        ));
    }

    @Operation(summary = "Registrar una entrega despachada como entregada")
    @PostMapping("/{deliveryId}/deliver")
    public ResponseEntity<ApiResponse<DeliveryResponse>> deliver(
            @CurrentUserId Long currentUserId,
            @PathVariable Long deliveryId,
            @Valid @RequestBody CompleteDeliveryRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DELIVERY_DELIVERED,
                "Entrega registrada como entregada.",
                deliveryService.deliver(currentUserId, deliveryId, request)
        ));
    }

    @Operation(summary = "Vincular una versión documental como evidencia de entrega")
    @PutMapping("/{deliveryId}/evidence")
    public ResponseEntity<ApiResponse<DeliveryResponse>> attachEvidence(
            @CurrentUserId Long currentUserId,
            @PathVariable Long deliveryId,
            @Valid @RequestBody AttachDeliveryEvidenceRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DELIVERY_EVIDENCE_ATTACHED,
                "Evidencia vinculada correctamente.",
                deliveryService.attachEvidence(currentUserId, deliveryId, request)
        ));
    }

    @Operation(summary = "Cancelar una entrega pendiente o despachada")
    @PostMapping("/{deliveryId}/cancel")
    public ResponseEntity<ApiResponse<DeliveryResponse>> cancel(
            @CurrentUserId Long currentUserId,
            @PathVariable Long deliveryId,
            @Valid @RequestBody CancelDeliveryRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DELIVERY_CANCELLED,
                "Entrega cancelada correctamente.",
                deliveryService.cancel(currentUserId, deliveryId, request)
        ));
    }
}
