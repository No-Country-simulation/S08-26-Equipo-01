package com.nocountry.qualitytrack.dashboard.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.dashboard.dto.response.InternalDashboardResponse;
import com.nocountry.qualitytrack.dashboard.service.InternalDashboardService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/dashboard")
@RequiredArgsConstructor
@Tag(name = "Internal Dashboard", description = "Resumen operacional para usuarios internos.")
public class InternalDashboardController {

    private final InternalDashboardService internalDashboardService;

    @GetMapping
    @Operation(
            summary = "Consultar panel operacional",
            description = "Devuelve métricas del flujo, elementos que requieren atención y actividad reciente."
    )
    public ResponseEntity<ApiResponse<InternalDashboardResponse>> get(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_DASHBOARD_RETRIEVED,
                "Panel operacional consultado correctamente.",
                internalDashboardService.get(currentUserId)
        ));
    }
}
