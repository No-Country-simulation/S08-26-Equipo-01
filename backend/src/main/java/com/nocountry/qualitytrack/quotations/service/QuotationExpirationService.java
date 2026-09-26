package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuotationExpirationService {

    private final QuotationRepository quotationRepository;
    private final TraceabilityService traceabilityService;

    @Transactional
    public void expireIfDue(Long quotationId, LocalDate today) {
        Quotation quotation = quotationRepository.findByIdForUpdate(quotationId).orElse(null);
        if (quotation == null
                || quotation.getStatus() != QuotationStatus.SENT
                || !quotation.isExpiredOn(today)) {
            return;
        }

        QuotationStatus previousStatus = quotation.getStatus();
        quotation.expire();
        quotationRepository.saveAndFlush(quotation);

        traceabilityService.record(
                quotation.getJobCase(),
                TraceabilityAggregateType.QUOTATION,
                quotation.getId(),
                TraceabilityEventType.QUOTATION_EXPIRED,
                previousStatus.name(),
                quotation.getStatus().name(),
                null,
                metadata(
                        "quotationNumber", quotation.getQuotationNumber(),
                        "revision", quotation.getRevision(),
                        "validUntil", quotation.getValidUntil()
                )
        );
    }

    private Map<String, Object> metadata(Object... entries) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        for (int index = 0; index < entries.length; index += 2) {
            Object value = entries[index + 1];
            if (value != null) {
                metadata.put((String) entries[index], value);
            }
        }
        return metadata;
    }
}
