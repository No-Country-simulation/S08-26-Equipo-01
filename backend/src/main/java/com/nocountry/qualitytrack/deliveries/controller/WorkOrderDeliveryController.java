package com.nocountry.qualitytrack.deliveries.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.deliveries.documentation.DeliveryApiDocs;
import com.nocountry.qualitytrack.deliveries.dto.request.CreateDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.response.DeliveryResponse;
import com.nocountry.qualitytrack.deliveries.service.DeliveryService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/work-orders/{workOrderId}/deliveries")
@RequiredArgsConstructor
@DeliveryApiDocs
public class WorkOrderDeliveryController {

    private final DeliveryService deliveryService;

    @Operation(summary = "Preparar una entrega para una OT lista para entrega")
    @PostMapping
    public ResponseEntity<ApiResponse<DeliveryResponse>> create(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId,
            @Valid @RequestBody CreateDeliveryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.DELIVERY_CREATED,
                        "Entrega preparada correctamente.",
                        deliveryService.create(currentUserId, workOrderId, request)
                ));
    }

    @Operation(summary = "Listar entregas de una orden de trabajo")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DELIVERIES_RETRIEVED,
                "Entregas consultadas correctamente.",
                deliveryService.listByWorkOrder(currentUserId, workOrderId)
        ));
    }
}
