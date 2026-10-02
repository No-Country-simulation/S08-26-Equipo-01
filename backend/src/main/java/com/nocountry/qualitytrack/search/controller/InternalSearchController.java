package com.nocountry.qualitytrack.search.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.search.dto.response.InternalSearchResponse;
import com.nocountry.qualitytrack.search.service.InternalSearchService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/internal/search")
@RequiredArgsConstructor
@Validated
@Tag(name = "Internal Search", description = "Búsqueda transversal para el backoffice.")
public class InternalSearchController {

    private final InternalSearchService internalSearchService;

    @GetMapping
    @Operation(
            summary = "Buscar en QualityTrack",
            description = "Busca clientes, expedientes, cotizaciones, órdenes, materiales, lotes y documentos respetando los permisos del usuario interno."
    )
    public ResponseEntity<ApiResponse<InternalSearchResponse>> search(
            @CurrentUserId Long currentUserId,
            @RequestParam("q")
            @Size(min = 2, max = 100)
            String query
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.INTERNAL_SEARCH_COMPLETED,
                "Búsqueda completada correctamente.",
                internalSearchService.search(currentUserId, query)
        ));
    }
}
