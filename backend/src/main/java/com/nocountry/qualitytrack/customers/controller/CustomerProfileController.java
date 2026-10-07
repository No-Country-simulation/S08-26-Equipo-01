package com.nocountry.qualitytrack.customers.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.customers.dto.response.CustomerProfileResponse;
import com.nocountry.qualitytrack.customers.service.CustomerProfileService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import com.nocountry.qualitytrack.users.dto.request.ChangeOwnPasswordRequest;
import com.nocountry.qualitytrack.users.dto.request.UpdateOwnProfileRequest;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customers/me")
@RequiredArgsConstructor
public class CustomerProfileController {

    private final CustomerProfileService customerProfileService;

    @GetMapping
    @Operation(
            summary = "Consultar mi perfil de cliente",
            description = "Devuelve los datos personales y las empresas activas de la cuenta de cliente autenticada."
    )
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> getOwnProfile(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_PROFILE_RETRIEVED,
                "Perfil consultado correctamente.",
                customerProfileService.getOwnProfile(currentUserId)
        ));
    }

    @PutMapping
    @Operation(
            summary = "Actualizar mi perfil de cliente",
            description = "Permite modificar nombre y apellido. El correo y las membresías no se modifican desde el perfil."
    )
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> updateOwnProfile(
            @CurrentUserId Long currentUserId,
            @Valid @RequestBody UpdateOwnProfileRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_PROFILE_UPDATED,
                "Perfil actualizado correctamente.",
                customerProfileService.updateOwnProfile(currentUserId, request)
        ));
    }

    @PutMapping("/password")
    @Operation(
            summary = "Cambiar mi contraseña de cliente",
            description = "Cambia la contraseña después de validar la contraseña actual."
    )
    public ResponseEntity<ApiResponse<Void>> changeOwnPassword(
            @CurrentUserId Long currentUserId,
            @Valid @RequestBody ChangeOwnPasswordRequest request
    ) {
        customerProfileService.changeOwnPassword(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_PASSWORD_UPDATED,
                "Contraseña actualizada correctamente.",
                null
        ));
    }
}
