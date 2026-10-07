package com.nocountry.qualitytrack.deliveries.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.deliveries.documentation.DeliveryApiDocs;
import com.nocountry.qualitytrack.deliveries.dto.response.CustomerDeliveryResponse;
import com.nocountry.qualitytrack.deliveries.service.DeliveryService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/{customerId}/requests/{requestId}/deliveries")
@RequiredArgsConstructor
@DeliveryApiDocs
public class CustomerDeliveryController {

    private final DeliveryService deliveryService;

    @Operation(summary = "Consultar los envíos asociados a una solicitud")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerDeliveryResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DELIVERIES_RETRIEVED,
                "Envíos consultados correctamente.",
                deliveryService.listForCustomerRequest(currentUserId, customerId, requestId)
                        .stream()
                        .map(CustomerDeliveryResponse::from)
                        .toList()
        ));
    }

}
