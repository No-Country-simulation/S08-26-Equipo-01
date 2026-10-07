package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.quotations.dto.request.CancelQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.request.QuotationItemRequest;
import com.nocountry.qualitytrack.quotations.dto.request.RejectQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.request.RequestQuotationAdjustmentRequest;
import com.nocountry.qualitytrack.quotations.dto.request.SendQuotationRequest;
import com.nocountry.qualitytrack.quotations.dto.request.UpdateQuotationRequest;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.entity.QuotationItem;
import com.nocountry.qualitytrack.quotations.enums.CustomerQuotationStatus;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuotationWorkflowServiceTest {

    @Mock
    private QuotationRepository quotationRepository;
    @Mock
    private JobCaseRepository jobCaseRepository;
    @Mock
    private QuotationReferenceGenerator referenceGenerator;
    @Mock
    private QuotationAccessPolicy accessPolicy;
    @Mock
    private TraceabilityService traceabilityService;
    @Mock
    private QuotationSourceService quotationSourceService;
    @Mock
    private User commercialUser;
    @Mock
    private User customerUser;
    @Mock
    private User requester;
    @Mock
    private Customer customer;
    @Mock
    private CustomerMembership membership;

    private QuotationWorkflowService service;

    @BeforeEach
    void setUp() {
        service = new QuotationWorkflowService(
                quotationRepository,
                jobCaseRepository,
                referenceGenerator,
                accessPolicy,
                traceabilityService,
                quotationSourceService
        );
        ReflectionTestUtils.setField(service, "expirationZone", "America/Mazatlan");

        lenient().when(commercialUser.getId()).thenReturn(10L);
        lenient().when(commercialUser.getFirstName()).thenReturn("Carlos");
        lenient().when(commercialUser.getLastName()).thenReturn("Ruiz");
        lenient().when(customer.getId()).thenReturn(20L);
        lenient().when(customer.getName()).thenReturn("Industrias Delta");
        lenient().when(customerUser.getId()).thenReturn(42L);
    }

    @Test
    void createStartsFirstDraftOnlyFromReadyForQuotationCase() {
        JobCase jobCase = readyJobCase();
        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(jobCaseRepository.findByIdForUpdate(12L)).thenReturn(Optional.of(jobCase));
        when(quotationRepository.existsByJobCase_Id(12L)).thenReturn(false);
        when(referenceGenerator.nextQuotationNumber()).thenReturn("QUO-00000001");
        when(quotationRepository.saveAndFlush(any(Quotation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.create(10L, 12L);

        assertEquals(QuotationStatus.DRAFT, response.status());
        assertEquals(1, response.revision());
        assertEquals("QUO-00000001", response.quotationNumber());
        verify(traceabilityService).record(
                eq(jobCase),
                any(),
                nullable(Long.class),
                eq(TraceabilityEventType.QUOTATION_CREATED),
                isNull(),
                eq(QuotationStatus.DRAFT.name()),
                eq(10L),
                any()
        );
    }

    @Test
    void updateCalculatesServerSideTotalsAndSendLocksRevision() {
        JobCase jobCase = readyJobCase();
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", commercialUser);
        LocalDate today = LocalDate.now(ZoneId.of("America/Mexico_City"));

        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));
        when(quotationRepository.saveAndFlush(quotation)).thenReturn(quotation);

        UpdateQuotationRequest input = new UpdateQuotationRequest(
                "MXN",
                new BigDecimal("16.0000"),
                today.plusDays(15),
                today.plusDays(30),
                List.of(
                        new QuotationItemRequest(
                                null,
                                "Mecanizado de eje",
                                new BigDecimal("2.00"),
                                new BigDecimal("100.00")
                        ),
                        new QuotationItemRequest(
                                null,
                                "Inspección dimensional",
                                new BigDecimal("1.00"),
                                new BigDecimal("50.00")
                        )
                )
        );

        var updated = service.update(10L, 1L, input);

        assertEquals(new BigDecimal("250.00"), updated.subtotal());
        assertEquals(new BigDecimal("40.00"), updated.tax());
        assertEquals(new BigDecimal("290.00"), updated.total());
        assertEquals(2, updated.items().size());

        var sent = service.send(10L, 1L, null);

        assertEquals(QuotationStatus.SENT, sent.status());
        assertNotNull(sent.sentAt());
        verify(traceabilityService).record(
                eq(jobCase),
                any(),
                nullable(Long.class),
                eq(TraceabilityEventType.QUOTATION_SENT),
                eq(QuotationStatus.DRAFT.name()),
                eq(QuotationStatus.SENT.name()),
                eq(10L),
                any()
        );
    }

    @Test
    void updateSupportsZeroAndCustomTaxRates() {
        JobCase jobCase = readyJobCase();
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", commercialUser);
        LocalDate today = LocalDate.now(ZoneId.of("America/Mexico_City"));

        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));
        when(quotationRepository.saveAndFlush(quotation)).thenReturn(quotation);

        List<QuotationItemRequest> items = List.of(
                new QuotationItemRequest(
                        null,
                        "Mecanizado de eje",
                        new BigDecimal("1.00"),
                        new BigDecimal("100.00")
                )
        );

        var withoutTax = service.update(
                10L,
                1L,
                new UpdateQuotationRequest(
                        "MXN",
                        new BigDecimal("0.0000"),
                        today.plusDays(15),
                        today.plusDays(30),
                        items
                )
        );

        assertEquals(new BigDecimal("0.0000"), withoutTax.taxRate());
        assertEquals(new BigDecimal("0.00"), withoutTax.tax());
        assertEquals(new BigDecimal("100.00"), withoutTax.total());

        var customTax = service.update(
                10L,
                1L,
                new UpdateQuotationRequest(
                        "MXN",
                        new BigDecimal("8.0000"),
                        today.plusDays(15),
                        today.plusDays(30),
                        items
                )
        );

        assertEquals(new BigDecimal("8.0000"), customTax.taxRate());
        assertEquals(new BigDecimal("8.00"), customTax.tax());
        assertEquals(new BigDecimal("108.00"), customTax.total());
    }

    @Test
    void updatePreservesExistingItemIdsCreatesNewItemsAndRemovesOmittedOnes() {
        JobCase jobCase = readyJobCase();
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", commercialUser);
        LocalDate today = LocalDate.now(ZoneId.of("America/Mexico_City"));

        QuotationItem retained = QuotationItem.create(
                quotation,
                1,
                "Mecanizado original",
                new BigDecimal("1.00"),
                new BigDecimal("100.00"),
                new BigDecimal("100.00")
        );
        QuotationItem removed = QuotationItem.create(
                quotation,
                2,
                "Concepto a eliminar",
                new BigDecimal("1.00"),
                new BigDecimal("25.00"),
                new BigDecimal("25.00")
        );
        ReflectionTestUtils.setField(retained, "id", 101L);
        ReflectionTestUtils.setField(removed, "id", 102L);

        quotation.replaceDraftContent(
                "MXN",
                new BigDecimal("16.0000"),
                today.plusDays(10),
                today.plusDays(20),
                List.of(retained, removed),
                new BigDecimal("125.00"),
                new BigDecimal("20.00"),
                new BigDecimal("145.00")
        );

        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));
        when(quotationRepository.saveAndFlush(quotation)).thenReturn(quotation);

        var response = service.update(
                10L,
                1L,
                new UpdateQuotationRequest(
                        "MXN",
                        new BigDecimal("16.0000"),
                        today.plusDays(15),
                        today.plusDays(30),
                        List.of(
                                new QuotationItemRequest(
                                        101L,
                                        "Mecanizado actualizado",
                                        new BigDecimal("2.00"),
                                        new BigDecimal("100.00")
                                ),
                                new QuotationItemRequest(
                                        null,
                                        "Inspección dimensional",
                                        new BigDecimal("1.00"),
                                        new BigDecimal("50.00")
                                )
                        )
                )
        );

        assertEquals(2, quotation.getItems().size());
        assertSame(retained, quotation.getItems().get(0));
        assertEquals(101L, quotation.getItems().get(0).getId());
        assertEquals("Mecanizado actualizado", quotation.getItems().get(0).getDescription());
        assertEquals(new BigDecimal("200.00"), quotation.getItems().get(0).getSubtotal());
        assertEquals("Inspección dimensional", quotation.getItems().get(1).getDescription());
        assertEquals(new BigDecimal("250.00"), response.subtotal());
        assertEquals(new BigDecimal("40.00"), response.tax());
        assertEquals(new BigDecimal("290.00"), response.total());
    }

    @Test
    void updateRejectsItemIdThatDoesNotBelongToQuotation() {
        JobCase jobCase = readyJobCase();
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", commercialUser);
        LocalDate today = LocalDate.now(ZoneId.of("America/Mexico_City"));

        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));

        assertThrows(
                com.nocountry.qualitytrack.shared.exception.BusinessException.class,
                () -> service.update(
                        10L,
                        1L,
                        new UpdateQuotationRequest(
                                "MXN",
                                new BigDecimal("16.0000"),
                                today.plusDays(15),
                                today.plusDays(30),
                                List.of(new QuotationItemRequest(
                                        999L,
                                        "Concepto ajeno",
                                        new BigDecimal("1.00"),
                                        new BigDecimal("100.00")
                                ))
                        )
                )
        );
    }

    @Test
    void customerAdjustmentSupersedesSentRevisionAndCreatesNextDraft() {
        JobCase jobCase = readyJobCase();
        Quotation quotation = sentQuotation(jobCase);

        when(accessPolicy.requireCustomerDecisionActor(42L, 20L)).thenReturn(membership);
        when(membership.getUser()).thenReturn(customerUser);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));
        when(quotationRepository.saveAndFlush(any(Quotation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.requestAdjustment(
                42L,
                20L,
                1L,
                new RequestQuotationAdjustmentRequest("Reducir el plazo de entrega.")
        );

        ArgumentCaptor<Quotation> captor = ArgumentCaptor.forClass(Quotation.class);
        verify(quotationRepository, times(2)).saveAndFlush(captor.capture());
        Quotation nextRevision = captor.getAllValues().get(1);

        assertEquals(QuotationStatus.SUPERSEDED, quotation.getStatus());
        assertEquals(QuotationStatus.DRAFT, nextRevision.getStatus());
        assertEquals(2, nextRevision.getRevision());
        assertEquals(quotation.getQuotationNumber(), nextRevision.getQuotationNumber());
        assertEquals("Reducir el plazo de entrega.", nextRevision.getAdjustmentNotes());
        assertEquals(CustomerQuotationStatus.ADJUSTMENT_REQUESTED, response.customerStatus());
        assertEquals("Reducir el plazo de entrega.", response.adjustment().notes());
        assertSame(commercialUser, nextRevision.getCreatedByUser());
    }

    @Test
    void revisedQuotationRequiresCommercialResponseBeforeSend() {
        JobCase jobCase = readyJobCase();
        Quotation previous = sentQuotation(jobCase);
        Quotation revised = Quotation.revisedFrom(
                previous,
                commercialUser,
                "Reducir el plazo de entrega."
        );

        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(quotationRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(revised));

        assertThrows(
                com.nocountry.qualitytrack.shared.exception.BusinessException.class,
                () -> service.send(10L, 2L, new SendQuotationRequest(null))
        );
    }

    @Test
    void revisedQuotationSendsCommercialResponseTogetherWithQuote() {
        JobCase jobCase = readyJobCase();
        Quotation previous = sentQuotation(jobCase);
        Quotation revised = Quotation.revisedFrom(
                previous,
                commercialUser,
                "Reducir el plazo de entrega."
        );

        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(quotationRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(revised));
        when(quotationRepository.saveAndFlush(revised)).thenReturn(revised);

        var response = service.send(
                10L,
                2L,
                new SendQuotationRequest(
                        "Podemos reducir el plazo a 20 días manteniendo el precio propuesto."
                )
        );

        assertEquals(QuotationStatus.SENT, response.status());
        assertEquals(
                "Podemos reducir el plazo a 20 días manteniendo el precio propuesto.",
                response.adjustmentResponse()
        );
        assertEquals(
                "Podemos reducir el plazo a 20 días manteniendo el precio propuesto.",
                revised.getAdjustmentResponse()
        );
    }

    @Test
    void customerApprovalHandsCaseOffToWorkOrderQueue() {
        JobCase jobCase = readyJobCase();
        Quotation quotation = sentQuotation(jobCase);

        when(accessPolicy.requireCustomerDecisionActor(42L, 20L)).thenReturn(membership);
        when(membership.getUser()).thenReturn(customerUser);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));
        when(quotationRepository.saveAndFlush(quotation)).thenReturn(quotation);

        var response = service.approve(42L, 20L, 1L);

        assertEquals(CustomerQuotationStatus.APPROVED, response.customerStatus());
        assertNotNull(response.approvedAt());
        assertEquals(JobCaseStatus.AWAITING_WORK_ORDER, jobCase.getStatus());
        verify(traceabilityService).record(
                eq(jobCase),
                any(),
                nullable(Long.class),
                eq(TraceabilityEventType.QUOTATION_APPROVED),
                eq(QuotationStatus.SENT.name()),
                eq(QuotationStatus.APPROVED.name()),
                eq(42L),
                any()
        );
    }

    @Test
    void customerCanRejectCurrentSentRevision() {
        JobCase jobCase = readyJobCase();
        Quotation quotation = sentQuotation(jobCase);

        when(accessPolicy.requireCustomerDecisionActor(42L, 20L)).thenReturn(membership);
        when(membership.getUser()).thenReturn(customerUser);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));
        when(quotationRepository.saveAndFlush(quotation)).thenReturn(quotation);

        var response = service.reject(
                42L,
                20L,
                1L,
                new RejectQuotationRequest("El plazo ya no satisface la necesidad.")
        );

        assertEquals(CustomerQuotationStatus.REJECTED, response.customerStatus());
        assertNotNull(response.rejectedAt());
        assertEquals("El plazo ya no satisface la necesidad.", response.rejectionReason());
        verify(traceabilityService).record(
                eq(jobCase),
                any(),
                nullable(Long.class),
                eq(TraceabilityEventType.QUOTATION_REJECTED),
                eq(QuotationStatus.SENT.name()),
                eq(QuotationStatus.REJECTED.name()),
                eq(42L),
                any()
        );
    }

    @Test
    void internalCanCreateNewRevisionFromExpiredQuotation() {
        JobCase jobCase = readyJobCase();
        Quotation quotation = sentQuotation(
                jobCase,
                LocalDate.now(ZoneId.of("America/Mazatlan")).minusDays(1)
        );

        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));
        when(quotationRepository.existsByQuotationNumberAndRevisionGreaterThan(
                quotation.getQuotationNumber(),
                quotation.getRevision()
        )).thenReturn(false);
        when(quotationRepository.saveAndFlush(any(Quotation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.createRevision(10L, 1L);

        assertEquals(QuotationStatus.EXPIRED, quotation.getStatus());
        assertEquals(QuotationStatus.DRAFT, response.status());
        assertEquals(2, response.revision());
        assertEquals(quotation.getQuotationNumber(), response.quotationNumber());
        assertEquals(commercialUser.getId(), response.createdByUserId());
        assertNull(response.validUntil());
    }

    @Test
    void internalCanCreateNewRevisionFromRejectedQuotationWithoutAdjustmentContext() {
        JobCase jobCase = readyJobCase();
        Quotation quotation = sentQuotation(jobCase);
        quotation.reject("El cliente no acepta la propuesta.", Instant.now());

        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));
        when(quotationRepository.existsByQuotationNumberAndRevisionGreaterThan(
                quotation.getQuotationNumber(),
                quotation.getRevision()
        )).thenReturn(false);
        when(quotationRepository.saveAndFlush(any(Quotation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.createRevision(10L, 1L);

        assertEquals(QuotationStatus.DRAFT, response.status());
        assertEquals(2, response.revision());
        assertNull(response.adjustmentNotes());
        assertNull(response.adjustmentResponse());
    }

    @Test
    void overdueSentQuotationCannotBeCancelledBeforeSchedulerRuns() {
        JobCase jobCase = readyJobCase();
        Quotation quotation = sentQuotation(
                jobCase,
                LocalDate.now(ZoneId.of("America/Mazatlan")).minusDays(1)
        );

        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(quotationRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(quotation));

        assertThrows(
                com.nocountry.qualitytrack.shared.exception.BusinessException.class,
                () -> service.cancel(
                        10L,
                        1L,
                        new CancelQuotationRequest("Cerrar propuesta.")
                )
        );

        assertEquals(QuotationStatus.SENT, quotation.getStatus());
    }

    @Test
    void adjustmentDraftCannotBeCancelledBeforeCommercialResponse() {
        JobCase jobCase = readyJobCase();
        Quotation previous = sentQuotation(jobCase);
        Quotation revised = Quotation.revisedFrom(
                previous,
                commercialUser,
                "Reducir el plazo de entrega."
        );

        when(accessPolicy.requireCommercialActor(10L)).thenReturn(commercialUser);
        when(quotationRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(revised));

        assertThrows(
                com.nocountry.qualitytrack.shared.exception.BusinessException.class,
                () -> service.cancel(
                        10L,
                        2L,
                        new CancelQuotationRequest("Cerrar revisión.")
                )
        );
    }

    private Quotation sentQuotation(JobCase jobCase) {
        LocalDate today = LocalDate.now(ZoneId.of("America/Mazatlan"));
        return sentQuotation(jobCase, today.plusDays(10));
    }

    private Quotation sentQuotation(
            JobCase jobCase,
            LocalDate validUntil
    ) {
        LocalDate today = LocalDate.now(ZoneId.of("America/Mazatlan"));
        Quotation quotation = Quotation.draft(jobCase, "QUO-00000001", commercialUser);
        QuotationItem item = QuotationItem.create(
                quotation,
                1,
                "Mecanizado de eje",
                new BigDecimal("1.00"),
                new BigDecimal("100.00"),
                new BigDecimal("100.00")
        );
        quotation.replaceDraftContent(
                "MXN",
                new BigDecimal("16.0000"),
                validUntil,
                today.plusDays(20),
                List.of(item),
                new BigDecimal("100.00"),
                new BigDecimal("16.00"),
                new BigDecimal("116.00")
        );
        quotation.send(Instant.now());
        return quotation;
    }

    private JobCase readyJobCase() {
        CustomerRequest request = CustomerRequest.submit(
                customer,
                "REQ-00000001",
                null,
                "Eje de transmisión",
                "Fabricar conforme al plano.",
                25,
                MaterialRequirementType.SPECIFIED,
                "AISI 4140",
                LocalDate.now().plusDays(30),
                requester
        );
        JobCase jobCase = JobCase.open(request, "CASE-00000001", Instant.now());
        jobCase.takeForReview(commercialUser, Instant.now());
        jobCase.markReadyForQuotation();
        return jobCase;
    }
}
