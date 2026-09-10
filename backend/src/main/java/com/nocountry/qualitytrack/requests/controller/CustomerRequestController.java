package com.nocountry.qualitytrack.requests.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.requests.documentation.CancelCustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.documentation.CustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.documentation.GetCustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.documentation.ListCustomerRequestsApiDocs;
import com.nocountry.qualitytrack.requests.documentation.SubmitCustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.dto.request.CancelCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.service.CustomerRequestService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
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
@RequestMapping("/api/v1/customers/{customerId}/requests")
@RequiredArgsConstructor
@CustomerRequestApiDocs
public class CustomerRequestController {

    private final CustomerRequestService customerRequestService;

    @SubmitCustomerRequestApiDocs
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerRequestResponse>> submit(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @Valid @RequestBody SubmitCustomerRequest request
    ) {
        CustomerRequestResponse response = customerRequestService.submit(
                currentUserId,
                customerId,
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.CUSTOMER_REQUEST_SUBMITTED,
                        "Solicitud enviada correctamente.",
                        response
                ));
    }

    @ListCustomerRequestsApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerRequestResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId
    ) {
        List<CustomerRequestResponse> response = customerRequestService
                .listForCustomer(currentUserId, customerId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_REQUESTS_RETRIEVED,
                "Solicitudes consultadas correctamente.",
                response
        ));
    }

    @GetCustomerRequestApiDocs
    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<CustomerRequestResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId
    ) {
        CustomerRequestResponse response = customerRequestService
                .getForCustomer(currentUserId, customerId, requestId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_REQUEST_RETRIEVED,
                "Solicitud consultada correctamente.",
                response
        ));
    }

    @CancelCustomerRequestApiDocs
    @PostMapping("/{requestId}/cancel")
    public ResponseEntity<ApiResponse<CustomerRequestResponse>> cancel(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @Valid @RequestBody(required = false) CancelCustomerRequest request
    ) {
        CustomerRequestResponse response = customerRequestService.cancel(
                currentUserId,
                customerId,
                requestId,
                request
        );

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_REQUEST_CANCELLED,
                "Solicitud cancelada correctamente.",
                response
        ));
    }
}
