package com.nocountry.qualitytrack.dashboard.service;

import com.nocountry.qualitytrack.dashboard.dto.response.InternalDashboardResponse;
import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import com.nocountry.qualitytrack.nonconformities.repository.NonConformityRepository;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.entity.TraceabilityEvent;
import com.nocountry.qualitytrack.traceability.repository.TraceabilityEventRepository;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InternalDashboardService {

    private final JobCaseRepository jobCaseRepository;
    private final QuotationRepository quotationRepository;
    private final WorkOrderRepository workOrderRepository;
    private final NonConformityRepository nonConformityRepository;
    private final DeliveryRepository deliveryRepository;
    private final TraceabilityEventRepository traceabilityEventRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public InternalDashboardResponse get(Long currentUserId) {
        requireInternalReader(currentUserId);

        Map<JobCaseStatus, Long> caseCounts = jobCaseCounts();
        Map<WorkOrderStatus, Long> workOrderCounts = workOrderCounts();
        Map<QuotationStatus, Long> quotationCounts = quotationCounts();

        long submitted = count(caseCounts, JobCaseStatus.SUBMITTED);
        long underReview = count(caseCounts, JobCaseStatus.UNDER_REVIEW);
        long waitingCustomer = count(caseCounts, JobCaseStatus.WAITING_CUSTOMER_INFO);
        long readyForQuotation = count(caseCounts, JobCaseStatus.READY_FOR_QUOTATION);
        long awaitingWorkOrder = count(caseCounts, JobCaseStatus.AWAITING_WORK_ORDER);
        long inProduction = count(caseCounts, JobCaseStatus.IN_PRODUCTION);
        long completed = count(caseCounts, JobCaseStatus.COMPLETED);

        long openCases = submitted
                + underReview
                + waitingCustomer
                + readyForQuotation
                + awaitingWorkOrder
                + inProduction;

        long activeProduction =
                count(workOrderCounts, WorkOrderStatus.READY_FOR_PRODUCTION)
                + count(workOrderCounts, WorkOrderStatus.IN_PRODUCTION)
                + count(workOrderCounts, WorkOrderStatus.REWORK_IN_PROGRESS);
        long qualityPending = count(workOrderCounts, WorkOrderStatus.QUALITY_PENDING);
        long qualityHold = count(workOrderCounts, WorkOrderStatus.QUALITY_HOLD);
        long readyForDelivery = count(workOrderCounts, WorkOrderStatus.READY_FOR_DELIVERY);
        long openNonConformities = nonConformityRepository.countByStatus(NonConformityStatus.OPEN);
        long dispatchedDeliveries = deliveryRepository.countByStatus(DeliveryStatus.DISPATCHED);

        long draftQuotations = count(quotationCounts, QuotationStatus.DRAFT);
        long sentQuotations = count(quotationCounts, QuotationStatus.SENT);

        return new InternalDashboardResponse(
                new InternalDashboardResponse.Overview(
                        openCases,
                        activeProduction,
                        qualityPending + qualityHold,
                        readyForDelivery
                ),
                new InternalDashboardResponse.Pipeline(
                        submitted,
                        underReview,
                        waitingCustomer,
                        readyForQuotation,
                        awaitingWorkOrder,
                        inProduction,
                        completed
                ),
                new InternalDashboardResponse.Commercial(
                        draftQuotations,
                        sentQuotations
                ),
                List.of(
                        attention(
                                "UNASSIGNED_CASES",
                                "Solicitudes por tomar",
                                "Expedientes nuevos que todavía esperan responsable interno.",
                                submitted,
                                "warning",
                                "/job-cases"
                        ),
                        attention(
                                "READY_FOR_QUOTATION",
                                "Listos para cotizar",
                                "Revisiones terminadas que ya pueden pasar a propuesta comercial.",
                                readyForQuotation,
                                "info",
                                "/job-cases"
                        ),
                        attention(
                                "AWAITING_WORK_ORDER",
                                "Pendientes de crear OT",
                                "Cotizaciones aprobadas que ya pasaron a Operación y esperan una orden de trabajo.",
                                awaitingWorkOrder,
                                "warning",
                                "/work-orders"
                        ),
                        attention(
                                "QUALITY_PENDING",
                                "Calidad pendiente",
                                "Órdenes esperando inspección o resolución del área de calidad.",
                                qualityPending,
                                "warning",
                                "/quality"
                        ),
                        attention(
                                "QUALITY_HOLD",
                                "Bloqueos de calidad",
                                "Órdenes detenidas por un resultado de calidad no aprobado.",
                                qualityHold,
                                "danger",
                                "/quality"
                        ),
                        attention(
                                "OPEN_NON_CONFORMITIES",
                                "No conformidades abiertas",
                                "Hallazgos que todavía requieren disposición o cierre.",
                                openNonConformities,
                                "danger",
                                "/quality"
                        ),
                        attention(
                                "READY_FOR_DELIVERY",
                                "Listos para entrega",
                                "Órdenes aprobadas por calidad pendientes de salida logística.",
                                readyForDelivery,
                                "success",
                                "/deliveries"
                        ),
                        attention(
                                "DISPATCHED_DELIVERIES",
                                "Entregas en tránsito",
                                "Despachos que todavía no han sido confirmados como entregados.",
                                dispatchedDeliveries,
                                "info",
                                "/deliveries"
                        )
                ),
                traceabilityEventRepository
                        .findTop8ByOrderByOccurredAtDescIdDesc()
                        .stream()
                        .map(this::activity)
                        .toList()
        );
    }

    private Map<JobCaseStatus, Long> jobCaseCounts() {
        EnumMap<JobCaseStatus, Long> counts = new EnumMap<>(JobCaseStatus.class);
        jobCaseRepository.countGroupedByStatus()
                .forEach(row -> counts.put(row.getStatus(), row.getTotal()));
        return counts;
    }

    private Map<WorkOrderStatus, Long> workOrderCounts() {
        EnumMap<WorkOrderStatus, Long> counts = new EnumMap<>(WorkOrderStatus.class);
        workOrderRepository.countGroupedByStatus()
                .forEach(row -> counts.put(row.getStatus(), row.getTotal()));
        return counts;
    }

    private Map<QuotationStatus, Long> quotationCounts() {
        EnumMap<QuotationStatus, Long> counts = new EnumMap<>(QuotationStatus.class);
        quotationRepository.countGroupedByStatus()
                .forEach(row -> counts.put(row.getStatus(), row.getTotal()));
        return counts;
    }

    private <T extends Enum<T>> long count(Map<T, Long> counts, T status) {
        return counts.getOrDefault(status, 0L);
    }

    private InternalDashboardResponse.AttentionItem attention(
            String key,
            String label,
            String description,
            long count,
            String tone,
            String href
    ) {
        return new InternalDashboardResponse.AttentionItem(
                key,
                label,
                description,
                count,
                tone,
                href
        );
    }

    private InternalDashboardResponse.RecentActivity activity(TraceabilityEvent event) {
        User actor = event.getPerformedByUser();
        String performedByName = actor == null
                ? null
                : fullName(actor.getFirstName(), actor.getLastName());

        return new InternalDashboardResponse.RecentActivity(
                event.getId(),
                event.getJobCase().getId(),
                event.getJobCase().getCaseNumber(),
                event.getEventType(),
                performedByName,
                event.getOccurredAt()
        );
    }

    private String fullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String full = (first + " " + last).trim();
        return full.isBlank() ? null : full;
    }

    private void requireInternalReader(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "Solo un usuario interno activo puede consultar el panel."
                ));

        if (user.getAccountType() != AccountType.INTERNAL
                || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo un usuario interno activo puede consultar el panel."
            );
        }
    }
}
