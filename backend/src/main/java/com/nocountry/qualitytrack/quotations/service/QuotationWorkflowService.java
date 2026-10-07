package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.quotations.dto.request.CancelQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.request.QuotationItemRequest;
import com.nocountry.qualitytrack.quotations.dto.request.RejectQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.request.RequestQuotationAdjustmentRequest;
import com.nocountry.qualitytrack.quotations.dto.request.SendQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.request.UpdateQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.response.CustomerQuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.entity.QuotationItem;
import com.nocountry.qualitytrack.quotations.enums.CustomerQuotationStatus;
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
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class QuotationWorkflowService {

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private static final BigDecimal MAX_MONEY = new BigDecimal("999999999999.99");

    private final QuotationRepository quotationRepository;
    private final JobCaseRepository jobCaseRepository;
    private final QuotationReferenceGenerator referenceGenerator;
    private final QuotationAccessPolicy accessPolicy;
    private final TraceabilityService traceabilityService;
    private final QuotationSourceService quotationSourceService;

    @Value("${app.quotations.expiration-zone:America/Mazatlan}")
    private String expirationZone;

    @Transactional
    public QuotationDetailResponse create(Long currentUserId, Long caseId) {
        User actor = accessPolicy.requireCommercialActor(currentUserId);
        JobCase jobCase = requireCaseForUpdate(caseId);
        accessPolicy.requireAssignedCommercialOrAdmin(currentUserId, jobCase);

        if (jobCase.getStatus() != JobCaseStatus.READY_FOR_QUOTATION) {
            conflict("Solo se puede crear una cotización desde un expediente READY_FOR_QUOTATION.");
        }
        if (quotationRepository.existsByJobCase_Id(caseId)) {
            conflict("El expediente ya tiene un flujo de cotización iniciado.");
        }

        Quotation quotation = Quotation.draft(
                jobCase,
                referenceGenerator.nextQuotationNumber(),
                actor
        );
        quotation = quotationRepository.saveAndFlush(quotation);

        traceabilityService.record(
                jobCase,
                TraceabilityAggregateType.QUOTATION,
                quotation.getId(),
                TraceabilityEventType.QUOTATION_CREATED,
                null,
                QuotationStatus.DRAFT.name(),
                currentUserId,
                metadata(
                        "quotationNumber", quotation.getQuotationNumber(),
                        "revision", quotation.getRevision(),
                        "caseNumber", jobCase.getCaseNumber()
                )
        );

        return QuotationDetailResponse.from(
                quotation,
                quotationSourceService.get(currentUserId, quotation)
        );
    }

    @Transactional
    public QuotationDetailResponse update(
            Long currentUserId,
            Long quotationId,
            UpdateQuotationRequest input
    ) {
        accessPolicy.requireCommercialActor(currentUserId);
        Quotation quotation = requireQuotationForUpdate(quotationId);
        requireAssignedActor(currentUserId, quotation);
        requireStatus(quotation, QuotationStatus.DRAFT, "Solo una revisión DRAFT puede modificarse.");

        BigDecimal taxRate = input.taxRate().setScale(4, RoundingMode.HALF_UP);
        BigDecimal subtotal = BigDecimal.ZERO.setScale(2);
        List<QuotationItem> items = new ArrayList<>();
        Map<Long, QuotationItem> existingItemsById = new LinkedHashMap<>();
        Set<Long> referencedItemIds = new HashSet<>();

        for (QuotationItem existingItem : quotation.getItems()) {
            if (existingItem.getId() != null) {
                existingItemsById.put(existingItem.getId(), existingItem);
            }
        }

        for (int index = 0; index < input.items().size(); index++) {
            QuotationItemRequest item = input.items().get(index);
            BigDecimal quantity = item.quantity().setScale(2, RoundingMode.UNNECESSARY);
            BigDecimal unitPrice = item.unitPrice().setScale(2, RoundingMode.UNNECESSARY);
            BigDecimal lineSubtotal = quantity
                    .multiply(unitPrice)
                    .setScale(2, RoundingMode.HALF_UP);
            requireMoneyRange(lineSubtotal);

            subtotal = subtotal.add(lineSubtotal);
            requireMoneyRange(subtotal);

            QuotationItem quotationItem;
            if (item.id() == null) {
                quotationItem = QuotationItem.create(
                        quotation,
                        index + 1,
                        item.description(),
                        quantity,
                        unitPrice,
                        lineSubtotal
                );
            } else {
                if (!referencedItemIds.add(item.id())) {
                    conflict("El concepto " + item.id() + " está repetido en la solicitud.");
                }

                quotationItem = existingItemsById.get(item.id());
                if (quotationItem == null) {
                    conflict("El concepto " + item.id() + " no pertenece a esta cotización.");
                }

                quotationItem.updateDetails(
                        index + 1,
                        item.description(),
                        quantity,
                        unitPrice,
                        lineSubtotal
                );
            }

            items.add(quotationItem);
        }

        BigDecimal tax = subtotal
                .multiply(taxRate)
                .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);
        requireMoneyRange(tax);
        requireMoneyRange(total);

        quotation.replaceDraftContent(
                input.currency(),
                taxRate,
                input.validUntil(),
                input.estimatedDeliveryDate(),
                items,
                subtotal,
                tax,
                total
        );
        quotation = quotationRepository.saveAndFlush(quotation);

        return QuotationDetailResponse.from(
                quotation,
                quotationSourceService.get(currentUserId, quotation)
        );
    }

    @Transactional
    public QuotationDetailResponse send(
            Long currentUserId,
            Long quotationId,
            SendQuotationRequest input
    ) {
        accessPolicy.requireCommercialActor(currentUserId);
        Quotation quotation = requireQuotationForUpdate(quotationId);
        requireAssignedActor(currentUserId, quotation);
        requireStatus(quotation, QuotationStatus.DRAFT, "Solo una revisión DRAFT puede enviarse.");
        validateReadyToSend(quotation);

        String adjustmentResponse = input == null ? null : input.adjustmentResponse();
        validateAdjustmentResponse(quotation, adjustmentResponse);
        quotation.recordAdjustmentResponse(adjustmentResponse);

        QuotationStatus previousStatus = quotation.getStatus();
        quotation.send(Instant.now());
        quotation = quotationRepository.saveAndFlush(quotation);

        recordStatusEvent(
                quotation,
                TraceabilityEventType.QUOTATION_SENT,
                previousStatus,
                currentUserId,
                metadata(
                        "quotationNumber", quotation.getQuotationNumber(),
                        "revision", quotation.getRevision(),
                        "currency", quotation.getCurrency(),
                        "total", quotation.getTotal(),
                        "validUntil", quotation.getValidUntil(),
                        "estimatedDeliveryDate", quotation.getEstimatedDeliveryDate(),
                        "adjustmentResponse", quotation.getAdjustmentResponse()
                )
        );

        return QuotationDetailResponse.from(
                quotation,
                quotationSourceService.get(currentUserId, quotation)
        );
    }

    @Transactional
    public CustomerQuotationDetailResponse approve(
            Long currentUserId,
            Long customerId,
            Long quotationId
    ) {
        CustomerMembership membership = accessPolicy.requireCustomerDecisionActor(currentUserId, customerId);
        Quotation quotation = requireQuotationForUpdate(quotationId);
        requireCustomerQuotation(customerId, quotation);
        requireStatus(quotation, QuotationStatus.SENT, "Solo una revisión SENT puede aprobarse.");

        if (quotation.isExpiredOn(today())) {
            conflict("La cotización ya venció y no puede aprobarse.");
        }

        JobCase jobCase = quotation.getJobCase();
        if (jobCase.getStatus() != JobCaseStatus.READY_FOR_QUOTATION) {
            conflict("El expediente no está listo para recibir la aprobación comercial.");
        }

        QuotationStatus previousStatus = quotation.getStatus();
        JobCaseStatus previousCaseStatus = jobCase.getStatus();
        quotation.approve(Instant.now());
        jobCase.markAwaitingWorkOrder();
        quotation = quotationRepository.saveAndFlush(quotation);

        recordStatusEvent(
                quotation,
                TraceabilityEventType.QUOTATION_APPROVED,
                previousStatus,
                membership.getUser().getId(),
                metadata(
                        "quotationNumber", quotation.getQuotationNumber(),
                        "revision", quotation.getRevision(),
                        "total", quotation.getTotal(),
                        "customerId", customerId
                )
        );

        traceabilityService.record(
                jobCase,
                TraceabilityAggregateType.JOB_CASE,
                jobCase.getId(),
                TraceabilityEventType.JOB_CASE_STATUS_CHANGED,
                previousCaseStatus.name(),
                jobCase.getStatus().name(),
                membership.getUser().getId(),
                metadata(
                        "caseNumber", jobCase.getCaseNumber(),
                        "quotationId", quotation.getId(),
                        "quotationNumber", quotation.getQuotationNumber(),
                        "quotationRevision", quotation.getRevision()
                )
        );

        return CustomerQuotationDetailResponse.from(
                quotation,
                quotationSourceService.getForCustomer(quotation)
        );
    }

    @Transactional
    public CustomerQuotationDetailResponse requestAdjustment(
            Long currentUserId,
            Long customerId,
            Long quotationId,
            RequestQuotationAdjustmentRequest input
    ) {
        CustomerMembership membership = accessPolicy.requireCustomerDecisionActor(currentUserId, customerId);
        Quotation current = requireQuotationForUpdate(quotationId);
        requireCustomerQuotation(customerId, current);
        requireStatus(current, QuotationStatus.SENT, "Solo una revisión SENT puede solicitar ajustes.");

        if (current.isExpiredOn(today())) {
            conflict("La cotización ya venció y no admite solicitudes de ajuste.");
        }

        QuotationStatus previousStatus = current.getStatus();
        Quotation next = Quotation.revisedFrom(
                current,
                current.getCreatedByUser(),
                input.notes()
        );
        current.supersede();
        quotationRepository.saveAndFlush(current);
        next = quotationRepository.saveAndFlush(next);

        recordStatusEvent(
                current,
                TraceabilityEventType.QUOTATION_ADJUSTMENT_REQUESTED,
                previousStatus,
                membership.getUser().getId(),
                metadata(
                        "quotationNumber", current.getQuotationNumber(),
                        "revision", current.getRevision(),
                        "adjustmentNotes", input.notes(),
                        "nextQuotationId", next.getId(),
                        "nextRevision", next.getRevision()
                )
        );

        traceabilityService.record(
                next.getJobCase(),
                TraceabilityAggregateType.QUOTATION,
                next.getId(),
                TraceabilityEventType.QUOTATION_REVISION_CREATED,
                null,
                QuotationStatus.DRAFT.name(),
                membership.getUser().getId(),
                metadata(
                        "quotationNumber", next.getQuotationNumber(),
                        "revision", next.getRevision(),
                        "sourceQuotationId", current.getId(),
                        "sourceRevision", current.getRevision()
                )
        );

        return CustomerQuotationDetailResponse.from(
                current,
                CustomerQuotationStatus.ADJUSTMENT_REQUESTED,
                input.notes(),
                null,
                quotationSourceService.getForCustomer(current)
        );
    }

    @Transactional
    public CustomerQuotationDetailResponse reject(
            Long currentUserId,
            Long customerId,
            Long quotationId,
            RejectQuotationRequest input
    ) {
        CustomerMembership membership = accessPolicy.requireCustomerDecisionActor(currentUserId, customerId);
        Quotation quotation = requireQuotationForUpdate(quotationId);
        requireCustomerQuotation(customerId, quotation);
        requireStatus(quotation, QuotationStatus.SENT, "Solo una revisión SENT puede rechazarse.");

        if (quotation.isExpiredOn(today())) {
            conflict("La cotización ya venció y no puede rechazarse.");
        }

        QuotationStatus previousStatus = quotation.getStatus();
        quotation.reject(input == null ? null : input.reason(), Instant.now());
        quotation = quotationRepository.saveAndFlush(quotation);

        recordStatusEvent(
                quotation,
                TraceabilityEventType.QUOTATION_REJECTED,
                previousStatus,
                membership.getUser().getId(),
                metadata(
                        "quotationNumber", quotation.getQuotationNumber(),
                        "revision", quotation.getRevision(),
                        "reason", quotation.getRejectionReason(),
                        "customerId", customerId
                )
        );

        return CustomerQuotationDetailResponse.from(
                quotation,
                quotationSourceService.getForCustomer(quotation)
        );
    }

    @Transactional
    public QuotationDetailResponse createRevision(
            Long currentUserId,
            Long quotationId
    ) {
        User actor = accessPolicy.requireCommercialActor(currentUserId);
        Quotation previous = requireQuotationForUpdate(quotationId);
        requireAssignedActor(currentUserId, previous);

        if (previous.getStatus() == QuotationStatus.SENT
                && previous.isExpiredOn(today())) {
            QuotationStatus previousStatus = previous.getStatus();
            previous.expire();
            quotationRepository.saveAndFlush(previous);

            recordStatusEvent(
                    previous,
                    TraceabilityEventType.QUOTATION_EXPIRED,
                    previousStatus,
                    null,
                    metadata(
                            "quotationNumber", previous.getQuotationNumber(),
                            "revision", previous.getRevision(),
                            "validUntil", previous.getValidUntil()
                    )
            );
        }

        if (previous.getStatus() != QuotationStatus.EXPIRED
                && previous.getStatus() != QuotationStatus.CANCELLED
                && previous.getStatus() != QuotationStatus.REJECTED) {
            conflict("Solo una cotización EXPIRED, CANCELLED o REJECTED puede generar una nueva revisión manual.");
        }
        if (quotationRepository.existsByQuotationNumberAndRevisionGreaterThan(
                previous.getQuotationNumber(),
                previous.getRevision()
        )) {
            conflict("La cotización ya tiene una revisión posterior.");
        }

        Quotation next = Quotation.reissuedFrom(previous, actor);
        next = quotationRepository.saveAndFlush(next);

        traceabilityService.record(
                next.getJobCase(),
                TraceabilityAggregateType.QUOTATION,
                next.getId(),
                TraceabilityEventType.QUOTATION_REVISION_CREATED,
                null,
                QuotationStatus.DRAFT.name(),
                currentUserId,
                metadata(
                        "quotationNumber", next.getQuotationNumber(),
                        "revision", next.getRevision(),
                        "sourceQuotationId", previous.getId(),
                        "sourceRevision", previous.getRevision(),
                        "sourceStatus", previous.getStatus().name()
                )
        );

        return QuotationDetailResponse.from(
                next,
                quotationSourceService.get(currentUserId, next)
        );
    }

    @Transactional
    public QuotationDetailResponse cancel(
            Long currentUserId,
            Long quotationId,
            CancelQuotationRequest input
    ) {
        User actor = accessPolicy.requireCommercialActor(currentUserId);
        Quotation quotation = requireQuotationForUpdate(quotationId);
        requireAssignedActor(currentUserId, quotation);

        if (quotation.getStatus() == QuotationStatus.SENT
                && quotation.isExpiredOn(today())) {
            conflict("La cotización ya venció y no puede cancelarse. Crea una nueva revisión desde el estado EXPIRED.");
        }

        if (!quotation.canBeCancelled()) {
            conflict("Solo una cotización DRAFT o SENT puede cancelarse.");
        }
        if (quotation.getStatus() == QuotationStatus.DRAFT
                && quotation.getAdjustmentNotes() != null) {
            conflict("Una revisión DRAFT creada por una solicitud de ajuste debe responderse y enviarse; no puede cancelarse directamente.");
        }

        QuotationStatus previousStatus = quotation.getStatus();
        quotation.cancel(actor, input.reason(), Instant.now());
        quotation = quotationRepository.saveAndFlush(quotation);

        recordStatusEvent(
                quotation,
                TraceabilityEventType.QUOTATION_CANCELLED,
                previousStatus,
                currentUserId,
                metadata(
                        "quotationNumber", quotation.getQuotationNumber(),
                        "revision", quotation.getRevision(),
                        "reason", quotation.getCancellationReason()
                )
        );

        return QuotationDetailResponse.from(
                quotation,
                quotationSourceService.get(currentUserId, quotation)
        );
    }

    private void validateReadyToSend(Quotation quotation) {
        if (quotation.getItems().isEmpty()) {
            conflict("La cotización debe contener al menos un concepto antes de enviarse.");
        }
        if (quotation.getValidUntil() == null) {
            conflict("La vigencia de la cotización es obligatoria antes de enviarla.");
        }
        if (quotation.getEstimatedDeliveryDate() == null) {
            conflict("La fecha estimada de entrega es obligatoria antes de enviarla.");
        }

        LocalDate today = today();
        if (quotation.getValidUntil().isBefore(today)) {
            conflict("La vigencia de la cotización no puede estar vencida al momento del envío.");
        }
        if (quotation.getEstimatedDeliveryDate().isBefore(today)) {
            conflict("La fecha estimada de entrega no puede estar en el pasado.");
        }
    }

    private void validateAdjustmentResponse(
            Quotation quotation,
            String adjustmentResponse
    ) {
        boolean hasAdjustmentRequest = quotation.getAdjustmentNotes() != null
                && !quotation.getAdjustmentNotes().isBlank();
        boolean hasResponse = adjustmentResponse != null
                && !adjustmentResponse.isBlank();

        if (hasAdjustmentRequest && !hasResponse) {
            conflict("Debes responder la solicitud de ajuste antes de enviar la nueva revisión.");
        }
        if (!hasAdjustmentRequest && hasResponse) {
            conflict("La respuesta de ajuste solo aplica a revisiones creadas por una solicitud del cliente.");
        }
    }

    private void requireMoneyRange(BigDecimal value) {
        if (value.compareTo(MAX_MONEY) > 0) {
            conflict("El importe calculado excede el máximo permitido para una cotización.");
        }
    }

    private void requireAssignedActor(Long currentUserId, Quotation quotation) {
        accessPolicy.requireAssignedCommercialOrAdmin(currentUserId, quotation.getJobCase());
    }

    private void requireCustomerQuotation(Long customerId, Quotation quotation) {
        if (!customerId.equals(quotation.getJobCase().getCustomerRequest().getCustomer().getId())) {
            throw new BusinessException(
                    ApiErrorCode.RESOURCE_NOT_FOUND,
                    "No se encontró la cotización."
            );
        }
    }

    private JobCase requireCaseForUpdate(Long caseId) {
        return jobCaseRepository.findByIdForUpdate(caseId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el expediente."
                ));
    }

    private Quotation requireQuotationForUpdate(Long quotationId) {
        return quotationRepository.findByIdForUpdate(quotationId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la cotización."
                ));
    }

    private void requireStatus(Quotation quotation, QuotationStatus status, String message) {
        if (quotation.getStatus() != status) {
            conflict(message);
        }
    }

    private void recordStatusEvent(
            Quotation quotation,
            TraceabilityEventType eventType,
            QuotationStatus previousStatus,
            Long actorUserId,
            Map<String, Object> metadata
    ) {
        traceabilityService.record(
                quotation.getJobCase(),
                TraceabilityAggregateType.QUOTATION,
                quotation.getId(),
                eventType,
                previousStatus.name(),
                quotation.getStatus().name(),
                actorUserId,
                metadata
        );
    }

    private Map<String, Object> metadata(Object... entries) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        for (int index = 0; index < entries.length; index += 2) {
            String key = (String) entries[index];
            Object value = entries[index + 1];
            if (value != null) {
                metadata.put(key, value);
            }
        }
        return metadata;
    }

    private LocalDate today() {
        return LocalDate.now(ZoneId.of(expirationZone));
    }

    private void conflict(String message) {
        throw new BusinessException(ApiErrorCode.DATA_CONFLICT, message);
    }
}
