package com.nocountry.qualitytrack.workorders.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import com.nocountry.qualitytrack.workorders.documentation.CancelWorkOrderApiDocs;
import com.nocountry.qualitytrack.workorders.documentation.GetWorkOrder360ApiDocs;
import com.nocountry.qualitytrack.workorders.documentation.GetWorkOrderApiDocs;
import com.nocountry.qualitytrack.workorders.documentation.PinWorkOrderDocumentApiDocs;
import com.nocountry.qualitytrack.workorders.documentation.ListWorkOrdersApiDocs;
import com.nocountry.qualitytrack.workorders.documentation.WorkOrderApiDocs;
import com.nocountry.qualitytrack.workorders.documentation.UpdateWorkOrderPlanningApiDocs;
import com.nocountry.qualitytrack.workorders.dto.request.CancelWorkOrderRequest;
import com.nocountry.qualitytrack.workorders.dto.request.PinWorkOrderDocumentRequest;
import com.nocountry.qualitytrack.workorders.dto.request.UpdateWorkOrderPlanningRequest;
import com.nocountry.qualitytrack.workorders.dto.response.PendingWorkOrderResponse;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrder360Response;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDetailResponse;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDocumentResponse;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderResponse;
import com.nocountry.qualitytrack.workorders.service.WorkOrder360Service;
import com.nocountry.qualitytrack.workorders.service.WorkOrderDocumentService;
import com.nocountry.qualitytrack.workorders.service.WorkOrderService;
import com.nocountry.qualitytrack.workorders.service.WorkOrderWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/work-orders")
@RequiredArgsConstructor
@WorkOrderApiDocs
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final WorkOrderWorkflowService workflowService;
    private final WorkOrderDocumentService documentService;
    private final WorkOrder360Service workOrder360Service;

    @ListWorkOrdersApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<WorkOrderResponse>>> list(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDERS_RETRIEVED,
                "Órdenes de trabajo consultadas correctamente.",
                workOrderService.list(currentUserId)
        ));
    }

    @GetMapping("/pending-creation")
    public ResponseEntity<ApiResponse<List<PendingWorkOrderResponse>>> listPendingCreation(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_CANDIDATES_RETRIEVED,
                "Pendientes de crear orden de trabajo consultados correctamente.",
                workOrderService.listPendingCreation(currentUserId)
        ));
    }

    @GetWorkOrderApiDocs
    @GetMapping("/{workOrderId}")
    public ResponseEntity<ApiResponse<WorkOrderDetailResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_RETRIEVED,
                "Orden de trabajo consultada correctamente.",
                workOrderService.get(currentUserId, workOrderId)
        ));
    }

    @GetWorkOrder360ApiDocs
    @GetMapping("/{workOrderId}/360")
    public ResponseEntity<ApiResponse<WorkOrder360Response>> get360(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_360_RETRIEVED,
                "Expediente 360 consultado correctamente.",
                workOrder360Service.get(currentUserId, workOrderId)
        ));
    }

    @UpdateWorkOrderPlanningApiDocs
    @PutMapping("/{workOrderId}/planning")
    public ResponseEntity<ApiResponse<WorkOrderDetailResponse>> updatePlanning(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId,
            @Valid @RequestBody UpdateWorkOrderPlanningRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_PLANNING_UPDATED,
                "Planificación de la orden de trabajo actualizada correctamente.",
                workflowService.updatePlanning(currentUserId, workOrderId, request)
        ));
    }

    @PinWorkOrderDocumentApiDocs
    @PutMapping("/{workOrderId}/documents/{documentId}")
    public ResponseEntity<ApiResponse<WorkOrderDocumentResponse>> pinDocument(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId,
            @PathVariable Long documentId,
            @Valid @RequestBody PinWorkOrderDocumentRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_DOCUMENT_PINNED,
                "Versión del documento fijada para la orden de trabajo.",
                documentService.pin(currentUserId, workOrderId, documentId, request.versionId())
        ));
    }

    @CancelWorkOrderApiDocs
    @PostMapping("/{workOrderId}/cancel")
    public ResponseEntity<ApiResponse<WorkOrderDetailResponse>> cancel(
            @CurrentUserId Long currentUserId,
            @PathVariable Long workOrderId,
            @Valid @RequestBody(required = false) CancelWorkOrderRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.WORK_ORDER_CANCELLED,
                "Orden de trabajo cancelada correctamente.",
                workflowService.cancel(currentUserId, workOrderId, request)
        ));
    }
}
