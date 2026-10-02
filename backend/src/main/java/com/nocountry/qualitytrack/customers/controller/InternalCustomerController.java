package com.nocountry.qualitytrack.customers.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.customers.dto.response.InternalCustomerDetailResponse;
import com.nocountry.qualitytrack.customers.dto.response.InternalCustomerSummaryResponse;
import com.nocountry.qualitytrack.customers.service.InternalCustomerQueryService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/internal/customers")
@RequiredArgsConstructor
@Tag(name = "Internal Customers", description = "Consulta transversal de empresas cliente para el backoffice.")
public class InternalCustomerController {

    private final InternalCustomerQueryService internalCustomerQueryService;

    @GetMapping
    @Operation(
            summary = "Consultar empresas cliente",
            description = "Lista las empresas cliente con métricas operativas agregadas. Disponible para usuarios internos activos."
    )
    public ResponseEntity<ApiResponse<List<InternalCustomerSummaryResponse>>> list(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_CUSTOMERS_RETRIEVED,
                "Empresas cliente consultadas correctamente.",
                internalCustomerQueryService.list(currentUserId)
        ));
    }

    @GetMapping("/{customerId}")
    @Operation(
            summary = "Consultar contexto de una empresa cliente",
            description = "Devuelve datos de empresa, miembros activos y expedientes asociados para consulta interna."
    )
    public ResponseEntity<ApiResponse<InternalCustomerDetailResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_CUSTOMER_RETRIEVED,
                "Contexto de empresa consultado correctamente.",
                internalCustomerQueryService.get(currentUserId, customerId)
        ));
    }
}
