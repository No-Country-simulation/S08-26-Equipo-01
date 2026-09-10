package com.nocountry.qualitytrack.customers.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.customers.documentation.CreateCustomerApiDocs;
import com.nocountry.qualitytrack.customers.documentation.CustomerApiDocs;
import com.nocountry.qualitytrack.customers.documentation.GetCustomerApiDocs;
import com.nocountry.qualitytrack.customers.documentation.ListCustomerMembersApiDocs;
import com.nocountry.qualitytrack.customers.documentation.RemoveCustomerMemberApiDocs;
import com.nocountry.qualitytrack.customers.documentation.UpdateCustomerApiDocs;
import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.request.UpdateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerMemberResponse;
import com.nocountry.qualitytrack.customers.dto.response.CustomerResponse;
import com.nocountry.qualitytrack.customers.service.CustomerService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customers")
@RequiredArgsConstructor
@CustomerApiDocs
public class CustomerController {

    private final CustomerService customerService;

    @CreateCustomerApiDocs
    @PostMapping
    public ResponseEntity<ApiResponse<CustomerResponse>> createCustomer(
            @CurrentUserId Long currentUserId,
            @Valid @RequestBody CreateCustomerRequest request
    ) {
        CustomerResponse response = customerService.createCustomer(currentUserId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.CUSTOMER_CREATED,
                        "Empresa creada correctamente.",
                        response
                ));
    }

    @GetCustomerApiDocs
    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomer(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId
    ) {
        CustomerResponse response = customerService.getCustomer(currentUserId, customerId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_RETRIEVED,
                "Empresa consultada correctamente.",
                response
        ));
    }

    @UpdateCustomerApiDocs
    @PatchMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @Valid @RequestBody UpdateCustomerRequest request
    ) {
        CustomerResponse response = customerService.updateCustomer(currentUserId, customerId, request);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_UPDATED,
                "Empresa actualizada correctamente.",
                response
        ));
    }

    @ListCustomerMembersApiDocs
    @GetMapping("/{customerId}/members")
    public ResponseEntity<ApiResponse<List<CustomerMemberResponse>>> listMembers(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId
    ) {
        List<CustomerMemberResponse> response = customerService.listMembers(currentUserId, customerId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_MEMBERS_RETRIEVED,
                "Miembros de la empresa consultados correctamente.",
                response
        ));
    }

    @RemoveCustomerMemberApiDocs
    @DeleteMapping("/{customerId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long userId
    ) {
        customerService.removeMember(currentUserId, customerId, userId);
        return ResponseEntity.noContent().build();
    }
}
