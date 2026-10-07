package com.nocountry.qualitytrack.users.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import com.nocountry.qualitytrack.users.documentation.InternalUserManagementApiDocs;
import com.nocountry.qualitytrack.users.dto.request.ChangeOwnPasswordRequest;
import com.nocountry.qualitytrack.users.dto.request.UpdateInternalUserRolesRequest;
import com.nocountry.qualitytrack.users.dto.request.UpdateInternalUserStatusRequest;
import com.nocountry.qualitytrack.users.dto.request.UpdateOwnProfileRequest;
import com.nocountry.qualitytrack.users.dto.response.InternalUserResponse;
import com.nocountry.qualitytrack.users.service.InternalUserService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/internal/users")
@RequiredArgsConstructor
@InternalUserManagementApiDocs
public class InternalUserController {

    private final InternalUserService internalUserService;

    @GetMapping("/me")
    @Operation(
            summary = "Consultar mi perfil interno",
            description = "Devuelve los datos personales, estado y roles de la cuenta interna autenticada."
    )
    public ResponseEntity<ApiResponse<InternalUserResponse>> getOwnProfile(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_PROFILE_RETRIEVED,
                "Perfil consultado correctamente.",
                internalUserService.getOwnProfile(currentUserId)
        ));
    }

    @PutMapping("/me")
    @Operation(
            summary = "Actualizar mi perfil interno",
            description = "Permite modificar únicamente nombre y apellido. El correo, estado y roles no pueden modificarse desde el perfil propio."
    )
    public ResponseEntity<ApiResponse<InternalUserResponse>> updateOwnProfile(
            @CurrentUserId Long currentUserId,
            @Valid @RequestBody UpdateOwnProfileRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_PROFILE_UPDATED,
                "Perfil actualizado correctamente.",
                internalUserService.updateOwnProfile(currentUserId, request)
        ));
    }

    @PutMapping("/me/password")
    @Operation(
            summary = "Cambiar mi contraseña",
            description = "Cambia la contraseña de la cuenta interna autenticada después de validar la contraseña actual."
    )
    public ResponseEntity<ApiResponse<Void>> changeOwnPassword(
            @CurrentUserId Long currentUserId,
            @Valid @RequestBody ChangeOwnPasswordRequest request
    ) {
        internalUserService.changeOwnPassword(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_PASSWORD_UPDATED,
                "Contraseña actualizada correctamente.",
                null
        ));
    }

    @GetMapping
    @Operation(
            summary = "Consultar usuarios internos",
            description = "Lista las cuentas internas y sus roles. Solo un ADMIN interno activo puede consultar este recurso."
    )
    public ResponseEntity<ApiResponse<List<InternalUserResponse>>> list(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_USERS_RETRIEVED,
                "Usuarios internos consultados correctamente.",
                internalUserService.list(currentUserId)
        ));
    }

    @GetMapping("/{userId}")
    @Operation(
            summary = "Consultar usuario interno",
            description = "Devuelve el estado y los roles actuales de una cuenta interna."
    )
    public ResponseEntity<ApiResponse<InternalUserResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long userId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_USER_RETRIEVED,
                "Usuario interno consultado correctamente.",
                internalUserService.get(currentUserId, userId)
        ));
    }

    @PutMapping("/{userId}/roles")
    @Operation(
            summary = "Reemplazar roles de usuario interno",
            description = "Reemplaza el conjunto completo de roles del usuario. No permite modificar los propios roles ni dejar al sistema sin un ADMIN interno activo."
    )
    public ResponseEntity<ApiResponse<InternalUserResponse>> updateRoles(
            @CurrentUserId Long currentUserId,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateInternalUserRolesRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_USER_ROLES_UPDATED,
                "Roles internos actualizados correctamente.",
                internalUserService.updateRoles(currentUserId, userId, request)
        ));
    }

    @PatchMapping("/{userId}/status")
    @Operation(
            summary = "Actualizar acceso de usuario interno",
            description = "Permite suspender o reactivar una cuenta interna ya activada. Las cuentas PENDING_ACTIVATION deben completar su invitación y no pueden activarse manualmente desde este endpoint."
    )
    public ResponseEntity<ApiResponse<InternalUserResponse>> updateStatus(
            @CurrentUserId Long currentUserId,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateInternalUserStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_USER_STATUS_UPDATED,
                "Estado de acceso actualizado correctamente.",
                internalUserService.updateStatus(currentUserId, userId, request)
        ));
    }
}
