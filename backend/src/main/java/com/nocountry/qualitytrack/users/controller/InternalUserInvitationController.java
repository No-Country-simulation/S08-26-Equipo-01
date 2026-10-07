package com.nocountry.qualitytrack.users.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import com.nocountry.qualitytrack.users.documentation.AcceptInternalUserInvitationApiDocs;
import com.nocountry.qualitytrack.users.documentation.CreateInternalUserInvitationApiDocs;
import com.nocountry.qualitytrack.users.documentation.InternalUserInvitationApiDocs;
import com.nocountry.qualitytrack.users.documentation.ResolveInternalUserInvitationApiDocs;
import com.nocountry.qualitytrack.users.dto.request.CompleteInternalUserInvitationRequest;
import com.nocountry.qualitytrack.users.dto.request.CreateInternalUserInvitationRequest;
import com.nocountry.qualitytrack.users.dto.request.InternalUserInvitationTokenRequest;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationAcceptResponse;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationPreviewResponse;
import com.nocountry.qualitytrack.users.dto.response.InternalUserInvitationResponse;
import com.nocountry.qualitytrack.users.service.InternalUserInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@InternalUserInvitationApiDocs
public class InternalUserInvitationController {

    private final InternalUserInvitationService invitationService;

    @CreateInternalUserInvitationApiDocs
    @PostMapping("/internal/invitations")
    public ResponseEntity<ApiResponse<InternalUserInvitationResponse>> createInvitation(
            @CurrentUserId Long currentUserId,
            @Valid @RequestBody CreateInternalUserInvitationRequest request
    ) {
        InternalUserInvitationResponse response = invitationService.createInvitation(currentUserId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.INTERNAL_INVITATION_CREATED,
                        "Invitación interna enviada correctamente.",
                        response
                ));
    }

    @ResolveInternalUserInvitationApiDocs
    @PostMapping("/internal/invitations/resolve")
    public ResponseEntity<ApiResponse<InternalUserInvitationPreviewResponse>> resolveInvitation(
            @Valid @RequestBody InternalUserInvitationTokenRequest request
    ) {
        InternalUserInvitationPreviewResponse response = invitationService.resolveInvitation(request);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_INVITATION_RESOLVED,
                "Invitación interna disponible.",
                response
        ));
    }

    @AcceptInternalUserInvitationApiDocs
    @PostMapping("/internal/invitations/accept")
    public ResponseEntity<ApiResponse<InternalUserInvitationAcceptResponse>> acceptInvitation(
            @Valid @RequestBody CompleteInternalUserInvitationRequest request
    ) {
        InternalUserInvitationAcceptResponse response = invitationService.acceptInvitation(request);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_INVITATION_ACCEPTED,
                "Cuenta interna activada correctamente. Ya puedes iniciar sesión.",
                response
        ));
    }
}
