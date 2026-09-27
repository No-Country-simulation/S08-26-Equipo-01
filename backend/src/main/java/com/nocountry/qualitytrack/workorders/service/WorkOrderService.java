package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDetailResponse;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderResponse;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderAccessPolicy accessPolicy;
    private final WorkOrderSourceService sourceService;
    private final WorkOrderDocumentService documentService;

    @Transactional(readOnly = true)
    public List<WorkOrderResponse> list(Long currentUserId) {
        accessPolicy.requireInternalReader(currentUserId);
        return workOrderRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(WorkOrderResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkOrderDetailResponse get(Long currentUserId, Long workOrderId) {
        accessPolicy.requireInternalReader(currentUserId);

        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la orden de trabajo."
                ));

        return WorkOrderDetailResponse.from(
                workOrder,
                sourceService.get(currentUserId, workOrder),
                documentService.listPinned(workOrderId)
        );
    }
}
