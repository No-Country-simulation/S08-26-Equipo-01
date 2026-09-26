package com.nocountry.qualitytrack.quotations.entity;

import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class QuotationTest {

    private final JobCase jobCase = mock(JobCase.class);
    private final User creator = mock(User.class);

    @Test
    void draftStartsWithExpectedDefaults() {
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", creator);

        assertEquals(QuotationStatus.DRAFT, quotation.getStatus());
        assertEquals(1, quotation.getRevision());
        assertEquals("MXN", quotation.getCurrency());
        assertEquals(new BigDecimal("0.00"), quotation.getSubtotal());
        assertEquals(new BigDecimal("16.0000"), quotation.getTaxRate());
        assertEquals(new BigDecimal("0.00"), quotation.getTax());
        assertEquals(new BigDecimal("0.00"), quotation.getTotal());
        assertTrue(quotation.getItems().isEmpty());
    }

    @Test
    void revisionCopiesCommercialContentWithoutMutatingPreviousRevision() {
        Quotation original = Quotation.draft(jobCase, "QUO-00000001", creator);
        QuotationItem item = QuotationItem.create(
                original,
                1,
                "Mecanizado de eje",
                new BigDecimal("2.00"),
                new BigDecimal("100.00"),
                new BigDecimal("200.00")
        );

        original.replaceDraftContent(
                "MXN",
                new BigDecimal("16.0000"),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 30),
                List.of(item),
                new BigDecimal("200.00"),
                new BigDecimal("32.00"),
                new BigDecimal("232.00")
        );
        original.send(Instant.parse("2026-09-14T20:00:00Z"));

        Quotation revised = Quotation.revisedFrom(
                original,
                creator,
                "Ajustar el plazo de entrega."
        );

        assertEquals(QuotationStatus.SENT, original.getStatus());
        assertEquals(QuotationStatus.DRAFT, revised.getStatus());
        assertEquals(2, revised.getRevision());
        assertEquals(original.getQuotationNumber(), revised.getQuotationNumber());
        assertEquals(original.getCurrency(), revised.getCurrency());
        assertEquals(original.getSubtotal(), revised.getSubtotal());
        assertEquals(original.getTax(), revised.getTax());
        assertEquals(original.getTotal(), revised.getTotal());
        assertEquals(original.getValidUntil(), revised.getValidUntil());
        assertEquals(original.getEstimatedDeliveryDate(), revised.getEstimatedDeliveryDate());
        assertEquals("Ajustar el plazo de entrega.", revised.getAdjustmentNotes());
        assertEquals(1, revised.getItems().size());
        assertEquals("Mecanizado de eje", revised.getItems().get(0).getDescription());
        assertSame(revised, revised.getItems().get(0).getQuotation());
    }

    @Test
    void sentQuotationCanBeApprovedButApprovedQuotationCannotBeCancelled() {
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", creator);
        quotation.send(Instant.parse("2026-09-14T20:00:00Z"));

        assertTrue(quotation.canBeCancelled());

        quotation.approve(Instant.parse("2026-09-15T10:00:00Z"));

        assertEquals(QuotationStatus.APPROVED, quotation.getStatus());
        assertNotNull(quotation.getApprovedAt());
        assertFalse(quotation.canBeCancelled());
        assertThrows(
                IllegalStateException.class,
                () -> quotation.cancel(creator, "No aplica", Instant.now())
        );
    }

    @Test
    void sentQuotationCanBeRejected() {
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", creator);
        quotation.send(Instant.parse("2026-09-14T20:00:00Z"));

        quotation.reject(
                "El cliente decidió no continuar.",
                Instant.parse("2026-09-15T10:00:00Z")
        );

        assertEquals(QuotationStatus.REJECTED, quotation.getStatus());
        assertEquals("El cliente decidió no continuar.", quotation.getRejectionReason());
        assertNotNull(quotation.getRejectedAt());
    }

    @Test
    void terminalQuotationCanCreateFreshRevisionWithoutAdjustmentContext() {
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", creator);
        quotation.send(Instant.parse("2026-09-14T20:00:00Z"));
        quotation.expire();

        Quotation revised = Quotation.reissuedFrom(quotation, creator);

        assertEquals(QuotationStatus.DRAFT, revised.getStatus());
        assertEquals(2, revised.getRevision());
        assertEquals(quotation.getQuotationNumber(), revised.getQuotationNumber());
        assertEquals(quotation.getTotal(), revised.getTotal());
        assertNull(revised.getAdjustmentNotes());
        assertNull(revised.getAdjustmentResponse());
    }

    @Test
    void onlySentQuotationCanExpire() {
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", creator);

        assertThrows(IllegalStateException.class, quotation::expire);

        quotation.send(Instant.parse("2026-09-14T20:00:00Z"));
        quotation.expire();

        assertEquals(QuotationStatus.EXPIRED, quotation.getStatus());
    }
}
