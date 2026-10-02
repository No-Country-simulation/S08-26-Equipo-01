package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.dto.request.CancelWorkOrderRequest;
import com.nocountry.qualitytrack.workorders.dto.request.CreateWorkOrderRequest;
import com.nocountry.qualitytrack.workorders.dto.request.UpdateWorkOrderPlanningRequest;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderDetailResponse;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WorkOrderWorkflowService {

    private final WorkOrderRepository workOrderRepository;
    private final JobCaseRepository jobCaseRepository;
    private final QuotationRepository quotationRepository;
    private final WorkOrderReferenceGenerator referenceGenerator;
    private final WorkOrderAccessPolicy accessPolicy;
    private final WorkOrderSourceService sourceService;
    private final WorkOrderDocumentService documentService;
    private final TraceabilityService traceabilityService;

    @Transactional
    public WorkOrderDetailResponse create(
            Long currentUserId,
            Long caseId,
            CreateWorkOrderRequest input
    ) {
        User actor = accessPolicy.requireCreationActor(currentUserId);
        JobCase jobCase = requireCaseForUpdate(caseId);

        if (jobCase.getStatus() != JobCaseStatus.AWAITING_WORK_ORDER) {
            conflict("La orden de trabajo solo puede crearse desde un expediente AWAITING_WORK_ORDER.");
        }
        if (workOrderRepository.existsByJobCase_Id(caseId)) {
            conflict("El expediente ya tiene una orden de trabajo.");
        }

        Quotation approvedQuotation = quotationRepository
                .findByJobCase_IdAndStatus(caseId, QuotationStatus.APPROVED)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.DATA_CONFLICT,
                        "El expediente necesita una cotización APPROVED antes de crear la orden de trabajo."
                ));

        WorkOrder workOrder;
        try {
            workOrder = WorkOrder.create(
                    jobCase,
                    approvedQuotation,
                    referenceGenerator.nextWorkOrderNumber(),
                    input.priority(),
                    jobCase.getCustomerRequest().getQuantity(),
                    input.plannedStartDate(),
                    input.plannedEndDate(),
                    approvedQuotation.getEstimatedDeliveryDate(),
                    actor
            );
        } catch (IllegalArgumentException exception) {
            conflict(exception.getMessage());
            throw exception;
        }

        JobCaseStatus previousCaseStatus = jobCase.getStatus();
        jobCase.markInProduction();
        workOrder = workOrderRepository.saveAndFlush(workOrder);

        traceabilityService.record(
                jobCase,
                TraceabilityAggregateType.WORK_ORDER,
                workOrder.getId(),
                TraceabilityEventType.WORK_ORDER_CREATED,
                null,
                WorkOrderStatus.CREATED.name(),
                currentUserId,
                metadata(
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "caseNumber", jobCase.getCaseNumber(),
                        "quotationId", approvedQuotation.getId(),
                        "quotationNumber", approvedQuotation.getQuotationNumber(),
                        "quotationRevision", approvedQuotation.getRevision(),
                        "priority", workOrder.getPriority(),
                        "plannedQuantity", workOrder.getPlannedQuantity(),
                        "plannedStartDate", workOrder.getPlannedStartDate(),
                        "plannedEndDate", workOrder.getPlannedEndDate(),
                        "agreedDeliveryDate", workOrder.getAgreedDeliveryDate()
                )
        );

        traceabilityService.record(
                jobCase,
                TraceabilityAggregateType.JOB_CASE,
                jobCase.getId(),
                TraceabilityEventType.JOB_CASE_STATUS_CHANGED,
                previousCaseStatus.name(),
                jobCase.getStatus().name(),
                currentUserId,
                metadata(
                        "caseNumber", jobCase.getCaseNumber(),
                        "workOrderId", workOrder.getId(),
                        "workOrderNumber", workOrder.getWorkOrderNumber()
                )
        );

        return detail(currentUserId, workOrder);
    }

    @Transactional
    public WorkOrderDetailResponse updatePlanning(
            Long currentUserId,
            Long workOrderId,
            UpdateWorkOrderPlanningRequest input
    ) {
        accessPolicy.requirePlanningActor(currentUserId);

        WorkOrder workOrder = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la orden de trabajo."
                ));

        WorkOrderPriority previousPriority = workOrder.getPriority();
        LocalDate previousStartDate = workOrder.getPlannedStartDate();
        LocalDate previousEndDate = workOrder.getPlannedEndDate();

        try {
            workOrder.updatePlanning(
                    input.priority(),
                    input.plannedStartDate(),
                    input.plannedEndDate()
            );
        } catch (IllegalArgumentException | IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        workOrder = workOrderRepository.saveAndFlush(workOrder);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.WORK_ORDER,
                workOrder.getId(),
                TraceabilityEventType.WORK_ORDER_PLANNING_UPDATED,
                workOrder.getStatus().name(),
                workOrder.getStatus().name(),
                currentUserId,
                metadata(
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "previousPriority", previousPriority,
                        "previousPlannedStartDate", previousStartDate,
                        "previousPlannedEndDate", previousEndDate,
                        "priority", workOrder.getPriority(),
                        "plannedStartDate", workOrder.getPlannedStartDate(),
                        "plannedEndDate", workOrder.getPlannedEndDate(),
                        "agreedDeliveryDate", workOrder.getAgreedDeliveryDate()
                )
        );

        return detail(currentUserId, workOrder);
    }

    @Transactional
    public WorkOrderDetailResponse cancel(
            Long currentUserId,
            Long workOrderId,
            CancelWorkOrderRequest input
    ) {
        User actor = accessPolicy.requireProductionActor(currentUserId);

        WorkOrder workOrder = workOrderRepository.findByIdForUpdate(workOrderId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la orden de trabajo."
                ));

        WorkOrderStatus previousStatus = workOrder.getStatus();
        JobCaseStatus previousCaseStatus = workOrder.getJobCase().getStatus();
        String reason = input == null ? null : input.reason();
        Instant cancelledAt = Instant.now();

        try {
            workOrder.cancel(actor, reason, cancelledAt);
            workOrder.getJobCase().cancelFromProduction(actor, reason, cancelledAt);
        } catch (IllegalStateException exception) {
            conflict(exception.getMessage());
        }

        workOrder = workOrderRepository.saveAndFlush(workOrder);

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.WORK_ORDER,
                workOrder.getId(),
                TraceabilityEventType.WORK_ORDER_CANCELLED,
                previousStatus.name(),
                WorkOrderStatus.CANCELLED.name(),
                currentUserId,
                metadata(
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "reason", workOrder.getCancellationReason()
                )
        );

        traceabilityService.record(
                workOrder.getJobCase(),
                TraceabilityAggregateType.JOB_CASE,
                workOrder.getJobCase().getId(),
                TraceabilityEventType.JOB_CASE_STATUS_CHANGED,
                previousCaseStatus.name(),
                workOrder.getJobCase().getStatus().name(),
                currentUserId,
                metadata(
                        "caseNumber", workOrder.getJobCase().getCaseNumber(),
                        "workOrderId", workOrder.getId(),
                        "workOrderNumber", workOrder.getWorkOrderNumber(),
                        "reason", workOrder.getCancellationReason()
                )
        );

        return detail(currentUserId, workOrder);
    }

    private WorkOrderDetailResponse detail(Long currentUserId, WorkOrder workOrder) {
        return WorkOrderDetailResponse.from(
                workOrder,
                sourceService.get(currentUserId, workOrder),
                documentService.listPinned(workOrder.getId())
        );
    }

    private JobCase requireCaseForUpdate(Long caseId) {
        return jobCaseRepository.findByIdForUpdate(caseId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el expediente."
                ));
    }

    private Map<String, Object> metadata(Object... entries) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        for (int index = 0; index < entries.length; index += 2) {
            Object value = entries[index + 1];
            if (value != null) {
                metadata.put(String.valueOf(entries[index]), value);
            }
        }
        return metadata;
    }

    private void conflict(String message) {
        throw new BusinessException(ApiErrorCode.DATA_CONFLICT, message);
    }
}
