package com.nocountry.qualitytrack.customers.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.customers.dto.request.SaveCustomerAddressRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerAddressResponse;
import com.nocountry.qualitytrack.customers.service.CustomerAddressService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers/{customerId}/addresses")
@RequiredArgsConstructor
public class CustomerAddressController {

    private final CustomerAddressService addressService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerAddressResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_ADDRESSES_RETRIEVED,
                "Direcciones de la empresa consultadas correctamente.",
                addressService.list(currentUserId, customerId)
        ));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerAddressResponse>> create(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @Valid @RequestBody SaveCustomerAddressRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_ADDRESS_CREATED,
                "Dirección guardada correctamente.",
                addressService.create(currentUserId, customerId, request)
        ));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<CustomerAddressResponse>> update(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long addressId,
            @Valid @RequestBody SaveCustomerAddressRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_ADDRESS_UPDATED,
                "Dirección actualizada correctamente.",
                addressService.update(currentUserId, customerId, addressId, request)
        ));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> delete(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long addressId
    ) {
        addressService.delete(currentUserId, customerId, addressId);
        return ResponseEntity.noContent().build();
    }
}
