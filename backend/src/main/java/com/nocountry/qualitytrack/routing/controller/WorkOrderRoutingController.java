package com.nocountry.qualitytrack.routing.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.routing.documentation.CreateRoutingSheetApiDocs;
import com.nocountry.qualitytrack.routing.documentation.ListRoutingSheetsApiDocs;
import com.nocountry.qualitytrack.routing.documentation.RoutingApiDocs;
import com.nocountry.qualitytrack.routing.dto.response.RoutingSheetResponse;
import com.nocountry.qualitytrack.routing.service.RoutingService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/work-orders/{workOrderId}/routing-sheets")
@RequiredArgsConstructor
@RoutingApiDocs
public class WorkOrderRoutingController {

    private final RoutingService routingService;

    @CreateRoutingSheetApiDocs
    @PostMapping
    public ResponseEntity<ApiResponse<RoutingSheetResponse>> create(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.ROUTING_SHEET_CREATED,
                        "Hoja de ruta de producción creada correctamente.",
                        routingService.createProductionRouting(currentUserId, workOrderId)
                ));
    }

    @ListRoutingSheetsApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoutingSheetResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.ROUTING_SHEETS_RETRIEVED,
                "Hojas de ruta consultadas correctamente.",
                routingService.list(currentUserId, workOrderId)
        ));
    }
}
