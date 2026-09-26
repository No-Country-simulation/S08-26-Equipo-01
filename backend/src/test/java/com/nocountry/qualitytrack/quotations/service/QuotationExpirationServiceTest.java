package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuotationExpirationServiceTest {

    @Mock
    private QuotationRepository quotationRepository;
    @Mock
    private TraceabilityService traceabilityService;
    @Mock
    private JobCase jobCase;
    @Mock
    private User creator;

    @Test
    void sentQuotationExpiresOnlyAfterValidUntil() {
        Quotation quotation = sentQuotation(LocalDate.of(2026, 9, 14));

        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));
        when(quotationRepository.saveAndFlush(quotation)).thenReturn(quotation);

        QuotationExpirationService service = new QuotationExpirationService(
                quotationRepository,
                traceabilityService
        );
        service.expireIfDue(1L, LocalDate.of(2026, 9, 15));

        assertEquals(QuotationStatus.EXPIRED, quotation.getStatus());
        verify(traceabilityService).record(
                eq(jobCase),
                any(),
                nullable(Long.class),
                eq(TraceabilityEventType.QUOTATION_EXPIRED),
                eq(QuotationStatus.SENT.name()),
                eq(QuotationStatus.EXPIRED.name()),
                isNull(),
                any()
        );
    }

    @Test
    void quotationDoesNotExpireOnItsLastValidDay() {
        LocalDate validUntil = LocalDate.of(2026, 9, 14);
        Quotation quotation = sentQuotation(validUntil);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));

        QuotationExpirationService service = new QuotationExpirationService(
                quotationRepository,
                traceabilityService
        );
        service.expireIfDue(1L, validUntil);

        assertEquals(QuotationStatus.SENT, quotation.getStatus());
        verify(quotationRepository, never()).saveAndFlush(quotation);
        verify(traceabilityService, never()).record(
                any(),
                any(),
                nullable(Long.class),
                any(),
                any(),
                any(),
                nullable(Long.class),
                any()
        );
    }

    private Quotation sentQuotation(LocalDate validUntil) {
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", creator);
        quotation.replaceDraftContent(
                "MXN",
                BigDecimal.ZERO.setScale(4),
                validUntil,
                validUntil.plusDays(10),
                List.of(),
                BigDecimal.ZERO.setScale(2),
                BigDecimal.ZERO.setScale(2),
                BigDecimal.ZERO.setScale(2)
        );
        quotation.send(Instant.parse("2026-09-10T12:00:00Z"));
        return quotation;
    }
}
