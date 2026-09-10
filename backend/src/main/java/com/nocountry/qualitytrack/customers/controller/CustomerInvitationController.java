package com.nocountry.qualitytrack.customers.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.customers.documentation.AcceptCustomerInvitationApiDocs;
import com.nocountry.qualitytrack.customers.documentation.CompleteCustomerInvitationRegistrationApiDocs;
import com.nocountry.qualitytrack.customers.documentation.CreateCustomerInvitationApiDocs;
import com.nocountry.qualitytrack.customers.documentation.CustomerInvitationApiDocs;
import com.nocountry.qualitytrack.customers.documentation.ListCustomerInvitationsApiDocs;
import com.nocountry.qualitytrack.customers.documentation.ResolveCustomerInvitationApiDocs;
import com.nocountry.qualitytrack.customers.dto.request.CompleteCustomerInvitationRegistrationRequest;
import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerInvitationRequest;
import com.nocountry.qualitytrack.customers.dto.request.CustomerInvitationTokenRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerInvitationAcceptResponse;
import com.nocountry.qualitytrack.customers.dto.response.CustomerInvitationPreviewResponse;
import com.nocountry.qualitytrack.customers.dto.response.CustomerInvitationResponse;
import com.nocountry.qualitytrack.customers.enums.CustomerInvitationAcceptOutcome;
import com.nocountry.qualitytrack.customers.service.CustomerInvitationService;
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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@CustomerInvitationApiDocs
public class CustomerInvitationController {

    private final CustomerInvitationService invitationService;

    @CreateCustomerInvitationApiDocs
    @PostMapping("/customers/{customerId}/invitations")
    public ResponseEntity<ApiResponse<CustomerInvitationResponse>> createInvitation(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @Valid @RequestBody CreateCustomerInvitationRequest request
    ) {
        CustomerInvitationResponse response = invitationService.createInvitation(
                currentUserId,
                customerId,
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.CUSTOMER_INVITATION_CREATED,
                        "Invitación enviada correctamente.",
                        response
                ));
    }

    @ListCustomerInvitationsApiDocs
    @GetMapping("/customers/{customerId}/invitations")
    public ResponseEntity<ApiResponse<List<CustomerInvitationResponse>>> listPendingInvitations(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId
    ) {
        List<CustomerInvitationResponse> response = invitationService.listPendingInvitations(
                currentUserId,
                customerId
        );

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_INVITATIONS_RETRIEVED,
                "Invitaciones pendientes consultadas correctamente.",
                response
        ));
    }

    @ResolveCustomerInvitationApiDocs
    @PostMapping("/customer-invitations/resolve")
    public ResponseEntity<ApiResponse<CustomerInvitationPreviewResponse>> resolveInvitation(
            @Valid @RequestBody CustomerInvitationTokenRequest request
    ) {
        CustomerInvitationPreviewResponse response = invitationService.resolveInvitation(request);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_INVITATION_RESOLVED,
                "Invitación disponible.",
                response
        ));
    }

    @AcceptCustomerInvitationApiDocs
    @PostMapping("/customer-invitations/accept")
    public ResponseEntity<ApiResponse<CustomerInvitationAcceptResponse>> acceptInvitation(
            @Valid @RequestBody CustomerInvitationTokenRequest request
    ) {
        CustomerInvitationAcceptResponse response = invitationService.acceptInvitation(request);

        if (response.outcome() == CustomerInvitationAcceptOutcome.REGISTRATION_REQUIRED) {
            return ResponseEntity.ok(ApiResponse.success(
                    ApiSuccessCode.CUSTOMER_INVITATION_REGISTRATION_REQUIRED,
                    "Completa tus datos para crear la cuenta y finalizar la invitación.",
                    response
            ));
        }

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_INVITATION_ACCEPTED,
                "Invitación aceptada correctamente. Ya puedes iniciar sesión.",
                response
        ));
    }

    @CompleteCustomerInvitationRegistrationApiDocs
    @PostMapping("/customer-invitations/complete-registration")
    public ResponseEntity<ApiResponse<CustomerInvitationAcceptResponse>> completeRegistration(
            @Valid @RequestBody CompleteCustomerInvitationRegistrationRequest request
    ) {
        CustomerInvitationAcceptResponse response = invitationService.completeRegistration(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.CUSTOMER_INVITATION_REGISTRATION_COMPLETED,
                        "Cuenta creada e invitación aceptada correctamente. Ya puedes iniciar sesión.",
                        response
                ));
    }
}
