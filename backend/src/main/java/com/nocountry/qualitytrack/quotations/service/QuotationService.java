package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.quotations.dto.response.CustomerQuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.dto.response.CustomerQuotationResponse;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationDetailResponse;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationResponse;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.CustomerQuotationStatus;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final QuotationAccessPolicy accessPolicy;
    private final QuotationSourceService quotationSourceService;

    @Value("${app.quotations.expiration-zone:America/Mazatlan}")
    private String expirationZone;

    @Transactional(readOnly = true)
    public List<QuotationResponse> listInternal(Long currentUserId) {
        accessPolicy.requireInternalReader(currentUserId);

        return quotationRepository.findCurrentRevisions()
                .stream()
                .map(quotation -> QuotationResponse.from(
                        quotation,
                        effectiveInternalStatus(quotation)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public QuotationDetailResponse getInternal(Long currentUserId, Long quotationId) {
        accessPolicy.requireInternalReader(currentUserId);
        Quotation quotation = requireDetail(quotationId);
        return QuotationDetailResponse.from(
                quotation,
                effectiveInternalStatus(quotation),
                quotationSourceService.get(currentUserId, quotation)
        );
    }

    @Transactional(readOnly = true)
    public List<QuotationResponse> listRevisionsInternal(
            Long currentUserId,
            Long quotationId
    ) {
        accessPolicy.requireInternalReader(currentUserId);
        Quotation anchor = requireDetail(quotationId);

        return quotationRepository
                .findAllByQuotationNumberOrderByRevisionDesc(anchor.getQuotationNumber())
                .stream()
                .map(quotation -> QuotationResponse.from(
                        quotation,
                        effectiveInternalStatus(quotation)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CustomerQuotationResponse> listForCustomer(
            Long currentUserId,
            Long customerId
    ) {
        accessPolicy.requireCustomerReader(currentUserId, customerId);

        return quotationRepository
                .findLatestVisibleRevisionsForCustomer(customerId)
                .stream()
                .map(quotation -> CustomerQuotationResponse.from(
                        quotation,
                        customerStatusFor(
                                quotation,
                                quotation.getStatus() == QuotationStatus.SUPERSEDED
                        )
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerQuotationDetailResponse getForCustomer(
            Long currentUserId,
            Long customerId,
            Long quotationId
    ) {
        accessPolicy.requireCustomerReader(currentUserId, customerId);
        Quotation quotation = requireDetail(quotationId);

        if (!customerId.equals(quotation.getJobCase().getCustomerRequest().getCustomer().getId())
                || quotation.getSentAt() == null) {
            throw notFound();
        }

        Quotation nextRevision = quotation.getStatus() == QuotationStatus.SUPERSEDED
                ? quotationRepository.findByQuotationNumberAndRevision(
                        quotation.getQuotationNumber(),
                        quotation.getRevision() + 1
                ).orElse(null)
                : null;

        boolean adjustmentPending = nextRevision != null
                && nextRevision.getStatus() == QuotationStatus.DRAFT;

        String adjustmentNotes = adjustmentPending
                ? nextRevision.getAdjustmentNotes()
                : quotation.getAdjustmentNotes();
        String adjustmentResponse = adjustmentPending
                ? null
                : quotation.getAdjustmentResponse();

        return CustomerQuotationDetailResponse.from(
                quotation,
                customerStatusFor(quotation, adjustmentPending),
                adjustmentNotes,
                adjustmentResponse
        );
    }

    @Transactional(readOnly = true)
    public List<CustomerQuotationResponse> listRevisionsForCustomer(
            Long currentUserId,
            Long customerId,
            Long quotationId
    ) {
        accessPolicy.requireCustomerReader(currentUserId, customerId);
        Quotation anchor = requireDetail(quotationId);

        if (!customerId.equals(anchor.getJobCase().getCustomerRequest().getCustomer().getId())
                || anchor.getSentAt() == null) {
            throw notFound();
        }

        List<Quotation> revisions = quotationRepository
                .findAllByQuotationNumberOrderByRevisionDesc(anchor.getQuotationNumber());

        Map<Integer, Quotation> revisionsByNumber = revisions.stream()
                .collect(Collectors.toMap(Quotation::getRevision, quotation -> quotation));

        return revisions.stream()
                .filter(quotation -> quotation.getSentAt() != null)
                .map(quotation -> {
                    Quotation nextRevision = revisionsByNumber.get(quotation.getRevision() + 1);
                    boolean adjustmentPending = quotation.getStatus() == QuotationStatus.SUPERSEDED
                            && nextRevision != null
                            && nextRevision.getStatus() == QuotationStatus.DRAFT;

                    return CustomerQuotationResponse.from(
                            quotation,
                            customerStatusFor(quotation, adjustmentPending)
                    );
                })
                .toList();
    }

    private QuotationStatus effectiveInternalStatus(Quotation quotation) {
        if (quotation.getStatus() == QuotationStatus.SENT
                && quotation.isExpiredOn(today())) {
            return QuotationStatus.EXPIRED;
        }
        return quotation.getStatus();
    }

    private CustomerQuotationStatus customerStatusFor(
            Quotation quotation,
            boolean adjustmentPending
    ) {
        if (quotation.getStatus() == QuotationStatus.SENT
                && quotation.isExpiredOn(today())) {
            return CustomerQuotationStatus.EXPIRED;
        }

        return CustomerQuotationStatus.fromDomain(
                quotation.getStatus(),
                adjustmentPending
        );
    }

    private LocalDate today() {
        return LocalDate.now(ZoneId.of(expirationZone));
    }

    private Quotation requireDetail(Long quotationId) {
        return quotationRepository.findDetailById(quotationId)
                .orElseThrow(this::notFound);
    }

    private BusinessException notFound() {
        return new BusinessException(
                ApiErrorCode.RESOURCE_NOT_FOUND,
                "No se encontró la cotización."
        );
    }
}
