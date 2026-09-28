package com.nocountry.qualitytrack.nonconformities.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.nonconformities.documentation.NonConformityApiDocs;
import com.nocountry.qualitytrack.nonconformities.dto.request.AuthorizeUseAsIsRequest;
import com.nocountry.qualitytrack.nonconformities.dto.request.UpdateNonConformityRequest;
import com.nocountry.qualitytrack.nonconformities.dto.response.NonConformityResponse;
import com.nocountry.qualitytrack.nonconformities.dto.response.ScrapResolutionResponse;
import com.nocountry.qualitytrack.nonconformities.service.NonConformityService;
import com.nocountry.qualitytrack.routing.dto.response.RoutingSheetResponse;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/non-conformities")
@RequiredArgsConstructor
@NonConformityApiDocs
public class NonConformityController {

    private final NonConformityService nonConformityService;

    @Operation(summary = "Consultar una no conformidad")
    @GetMapping("/{nonConformityId}")
    public ResponseEntity<ApiResponse<NonConformityResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long nonConformityId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.NON_CONFORMITY_RETRIEVED,
                "No conformidad consultada correctamente.",
                nonConformityService.get(currentUserId, nonConformityId)
        ));
    }

    @Operation(summary = "Registrar cantidad afectada, severidad y descripción")
    @PutMapping("/{nonConformityId}")
    public ResponseEntity<ApiResponse<NonConformityResponse>> updateDetails(
            @CurrentUserId Long currentUserId,
            @PathVariable Long nonConformityId,
            @Valid @RequestBody UpdateNonConformityRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.NON_CONFORMITY_UPDATED,
                "No conformidad actualizada correctamente.",
                nonConformityService.updateDetails(
                        currentUserId,
                        nonConformityId,
                        request
                )
        ));
    }

    @Operation(summary = "Elegir REWORK y crear una nueva ruta ligada a la NC")
    @PostMapping("/{nonConformityId}/rework-routing")
    public ResponseEntity<ApiResponse<RoutingSheetResponse>> createReworkRouting(
            @CurrentUserId Long currentUserId,
            @PathVariable Long nonConformityId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.NON_CONFORMITY_REWORK_ROUTING_CREATED,
                        "Ruta de retrabajo creada correctamente.",
                        nonConformityService.createReworkRouting(
                                currentUserId,
                                nonConformityId
                        )
                ));
    }

    @Operation(summary = "Registrar disposición SCRAP y evaluar si la OT puede liberarse")
    @PostMapping("/{nonConformityId}/scrap")
    public ResponseEntity<ApiResponse<ScrapResolutionResponse>> recordScrap(
            @CurrentUserId Long currentUserId,
            @PathVariable Long nonConformityId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.NON_CONFORMITY_SCRAP_RECORDED,
                "Disposición SCRAP evaluada correctamente.",
                nonConformityService.recordScrap(
                        currentUserId,
                        nonConformityId
                )
        ));
    }

    @Operation(summary = "Autorizar USE_AS_IS y cerrar la no conformidad")
    @PostMapping("/{nonConformityId}/use-as-is")
    public ResponseEntity<ApiResponse<NonConformityResponse>> authorizeUseAsIs(
            @CurrentUserId Long currentUserId,
            @PathVariable Long nonConformityId,
            @Valid @RequestBody AuthorizeUseAsIsRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.NON_CONFORMITY_USE_AS_IS_AUTHORIZED,
                "Concesión USE_AS_IS autorizada correctamente.",
                nonConformityService.authorizeUseAsIs(
                        currentUserId,
                        nonConformityId,
                        request
                )
        ));
    }
}
