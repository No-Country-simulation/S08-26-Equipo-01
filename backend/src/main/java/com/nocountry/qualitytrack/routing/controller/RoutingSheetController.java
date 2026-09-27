package com.nocountry.qualitytrack.routing.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.routing.documentation.ApproveRoutingSheetApiDocs;
import com.nocountry.qualitytrack.routing.documentation.CreateRoutingOperationApiDocs;
import com.nocountry.qualitytrack.routing.documentation.DeleteRoutingOperationApiDocs;
import com.nocountry.qualitytrack.routing.documentation.GetRoutingSheetApiDocs;
import com.nocountry.qualitytrack.routing.documentation.ReleaseRoutingSheetApiDocs;
import com.nocountry.qualitytrack.routing.documentation.ReopenRoutingSheetApiDocs;
import com.nocountry.qualitytrack.routing.documentation.RoutingApiDocs;
import com.nocountry.qualitytrack.routing.documentation.UpdateRoutingOperationApiDocs;
import com.nocountry.qualitytrack.routing.dto.request.CreateRoutingOperationRequest;
import com.nocountry.qualitytrack.routing.dto.request.ReopenRoutingSheetRequest;
import com.nocountry.qualitytrack.routing.dto.request.UpdateRoutingOperationRequest;
import com.nocountry.qualitytrack.routing.dto.response.RoutingSheetResponse;
import com.nocountry.qualitytrack.routing.service.RoutingService;
import com.nocountry.qualitytrack.routing.service.RoutingWorkflowService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/routing-sheets")
@RequiredArgsConstructor
@RoutingApiDocs
public class RoutingSheetController {

    private final RoutingService routingService;
    private final RoutingWorkflowService workflowService;

    @GetRoutingSheetApiDocs
    @GetMapping("/{routingSheetId}")
    public ResponseEntity<ApiResponse<RoutingSheetResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long routingSheetId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.ROUTING_SHEET_RETRIEVED,
                "Hoja de ruta consultada correctamente.",
                routingService.get(currentUserId, routingSheetId)
        ));
    }

    @CreateRoutingOperationApiDocs
    @PostMapping("/{routingSheetId}/operations")
    public ResponseEntity<ApiResponse<RoutingSheetResponse>> addOperation(
            @CurrentUserId Long currentUserId,
            @PathVariable Long routingSheetId,
            @Valid @RequestBody CreateRoutingOperationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.ROUTING_OPERATION_CREATED,
                        "Operación agregada a la hoja de ruta.",
                        routingService.addOperation(currentUserId, routingSheetId, request)
                ));
    }

    @UpdateRoutingOperationApiDocs
    @PutMapping("/{routingSheetId}/operations/{operationId}")
    public ResponseEntity<ApiResponse<RoutingSheetResponse>> updateOperation(
            @CurrentUserId Long currentUserId,
            @PathVariable Long routingSheetId,
            @PathVariable Long operationId,
            @Valid @RequestBody UpdateRoutingOperationRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.ROUTING_OPERATION_UPDATED,
                "Operación actualizada correctamente.",
                routingService.updateOperation(
                        currentUserId,
                        routingSheetId,
                        operationId,
                        request
                )
        ));
    }

    @DeleteRoutingOperationApiDocs
    @DeleteMapping("/{routingSheetId}/operations/{operationId}")
    public ResponseEntity<ApiResponse<RoutingSheetResponse>> removeOperation(
            @CurrentUserId Long currentUserId,
            @PathVariable Long routingSheetId,
            @PathVariable Long operationId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.ROUTING_OPERATION_REMOVED,
                "Operación eliminada de la hoja de ruta.",
                routingService.removeOperation(currentUserId, routingSheetId, operationId)
        ));
    }

    @ApproveRoutingSheetApiDocs
    @PostMapping("/{routingSheetId}/approve")
    public ResponseEntity<ApiResponse<RoutingSheetResponse>> approve(
            @CurrentUserId Long currentUserId,
            @PathVariable Long routingSheetId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.ROUTING_SHEET_APPROVED,
                "Hoja de ruta aprobada correctamente.",
                workflowService.approve(currentUserId, routingSheetId)
        ));
    }

    @ReopenRoutingSheetApiDocs
    @PostMapping("/{routingSheetId}/reopen")
    public ResponseEntity<ApiResponse<RoutingSheetResponse>> reopen(
            @CurrentUserId Long currentUserId,
            @PathVariable Long routingSheetId,
            @Valid @RequestBody ReopenRoutingSheetRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.ROUTING_SHEET_REOPENED,
                "Hoja de ruta reabierta para correcciones.",
                workflowService.reopen(currentUserId, routingSheetId, request)
        ));
    }

    @ReleaseRoutingSheetApiDocs
    @PostMapping("/{routingSheetId}/release")
    public ResponseEntity<ApiResponse<RoutingSheetResponse>> release(
            @CurrentUserId Long currentUserId,
            @PathVariable Long routingSheetId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.ROUTING_SHEET_RELEASED,
                "Hoja de ruta liberada y orden lista para producción.",
                workflowService.release(currentUserId, routingSheetId)
        ));
    }
}
