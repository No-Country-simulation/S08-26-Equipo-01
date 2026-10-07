package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.CustomerQuotationStatus;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import com.nocountry.qualitytrack.quotations.repository.QuotationAdjustmentRequestRepository;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuotationServiceTest {

    @Mock
    private QuotationRepository quotationRepository;

    @Mock
    private QuotationAdjustmentRequestRepository adjustmentRequestRepository;

    @Mock
    private QuotationAccessPolicy accessPolicy;

    @Mock
    private QuotationSourceService quotationSourceService;

    private QuotationService service;

    @BeforeEach
    void setUp() {
        service = new QuotationService(
                quotationRepository,
                adjustmentRequestRepository,
                accessPolicy,
                quotationSourceService
        );
        ReflectionTestUtils.setField(service, "expirationZone", "America/Mazatlan");
    }

    @Test
    void internalListUsesOnlyCurrentRevisionOfEachQuotationFlow() {
        when(quotationRepository.findCurrentRevisions()).thenReturn(List.of());

        var response = service.listInternal(10L);

        assertTrue(response.isEmpty());
        verify(accessPolicy).requireInternalReader(10L);
        verify(quotationRepository).findCurrentRevisions();
    }

    @Test
    void customerDetailExposesAdjustmentRequestedWhileNextRevisionIsDraft() {
        Quotation current = mock(Quotation.class);
        Quotation next = mock(Quotation.class);
        JobCase jobCase = mock(JobCase.class);
        CustomerRequest request = mock(CustomerRequest.class);
        Customer customer = mock(Customer.class);

        when(quotationRepository.findDetailById(1L)).thenReturn(Optional.of(current));
        when(current.getJobCase()).thenReturn(jobCase);
        when(jobCase.getCustomerRequest()).thenReturn(request);
        when(request.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(20L);
        when(current.getStatus()).thenReturn(QuotationStatus.SUPERSEDED);
        when(current.getSentAt()).thenReturn(Instant.now());
        when(current.getQuotationNumber()).thenReturn("QT-00000001");
        when(current.getRevision()).thenReturn(1);
        when(current.getItems()).thenReturn(List.of());
        when(quotationRepository.findByQuotationNumberAndRevision(
                "QT-00000001",
                2
        )).thenReturn(Optional.of(next));
        when(next.getStatus()).thenReturn(QuotationStatus.DRAFT);
        when(next.getAdjustmentNotes()).thenReturn("Reducir el plazo de entrega.");

        var response = service.getForCustomer(42L, 20L, 1L);

        assertEquals(CustomerQuotationStatus.ADJUSTMENT_REQUESTED, response.customerStatus());
        assertEquals("Reducir el plazo de entrega.", response.adjustment().notes());
        assertNull(response.adjustment().response());
        verify(accessPolicy).requireCustomerReader(42L, 20L);
    }

    @Test
    void replacedSourceRevisionKeepsAdjustmentRequestAfterNextRevisionWasSent() {
        Quotation current = mock(Quotation.class);
        Quotation next = mock(Quotation.class);
        JobCase jobCase = mock(JobCase.class);
        CustomerRequest request = mock(CustomerRequest.class);
        Customer customer = mock(Customer.class);

        when(quotationRepository.findDetailById(1L)).thenReturn(Optional.of(current));
        when(current.getJobCase()).thenReturn(jobCase);
        when(jobCase.getCustomerRequest()).thenReturn(request);
        when(request.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(20L);
        when(current.getStatus()).thenReturn(QuotationStatus.SUPERSEDED);
        when(current.getSentAt()).thenReturn(Instant.now());
        when(current.getQuotationNumber()).thenReturn("QT-00000001");
        when(current.getRevision()).thenReturn(1);
        when(current.getItems()).thenReturn(List.of());

        when(quotationRepository.findByQuotationNumberAndRevision(
                "QT-00000001",
                2
        )).thenReturn(Optional.of(next));
        when(next.getStatus()).thenReturn(QuotationStatus.SENT);
        when(next.getAdjustmentNotes()).thenReturn("Reducir el plazo de entrega.");

        var response = service.getForCustomer(42L, 20L, 1L);

        assertEquals(CustomerQuotationStatus.REPLACED, response.customerStatus());
        assertEquals("Reducir el plazo de entrega.", response.adjustment().notes());
        assertNull(response.adjustment().response());
    }

    @Test
    void secondAdjustmentDoesNotExposePreviousAdjustmentResponse() {
        Quotation current = mock(Quotation.class);
        Quotation next = mock(Quotation.class);
        JobCase jobCase = mock(JobCase.class);
        CustomerRequest request = mock(CustomerRequest.class);
        Customer customer = mock(Customer.class);

        when(quotationRepository.findDetailById(2L)).thenReturn(Optional.of(current));
        when(current.getJobCase()).thenReturn(jobCase);
        when(jobCase.getCustomerRequest()).thenReturn(request);
        when(request.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(20L);
        when(current.getStatus()).thenReturn(QuotationStatus.SUPERSEDED);
        when(current.getSentAt()).thenReturn(Instant.now());
        when(current.getQuotationNumber()).thenReturn("QT-00000001");
        when(current.getRevision()).thenReturn(2);
        when(current.getItems()).thenReturn(List.of());

        when(quotationRepository.findByQuotationNumberAndRevision(
                "QT-00000001",
                3
        )).thenReturn(Optional.of(next));
        when(next.getStatus()).thenReturn(QuotationStatus.DRAFT);
        when(next.getAdjustmentNotes()).thenReturn("Segundo ajuste.");

        var response = service.getForCustomer(42L, 20L, 2L);

        assertEquals(CustomerQuotationStatus.ADJUSTMENT_REQUESTED, response.customerStatus());
        assertEquals("Segundo ajuste.", response.adjustment().notes());
        assertNull(response.adjustment().response());
    }

    @Test
    void sentAdjustedRevisionExposesRequestAndCommercialResponse() {
        Quotation quotation = mock(Quotation.class);
        JobCase jobCase = mock(JobCase.class);
        CustomerRequest request = mock(CustomerRequest.class);
        Customer customer = mock(Customer.class);

        when(quotationRepository.findDetailById(2L)).thenReturn(Optional.of(quotation));
        when(quotation.getJobCase()).thenReturn(jobCase);
        when(jobCase.getCustomerRequest()).thenReturn(request);
        when(request.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(20L);
        when(quotation.getStatus()).thenReturn(QuotationStatus.SENT);
        when(quotation.getSentAt()).thenReturn(Instant.now());
        when(quotation.getAdjustmentNotes()).thenReturn("Reducir el plazo de entrega.");
        when(quotation.getAdjustmentResponse()).thenReturn("Entrega ajustada a 12 días.");
        when(quotation.getItems()).thenReturn(List.of());

        var response = service.getForCustomer(42L, 20L, 2L);

        assertEquals(CustomerQuotationStatus.SENT, response.customerStatus());
        assertEquals("Reducir el plazo de entrega.", response.adjustment().notes());
        assertEquals("Entrega ajustada a 12 días.", response.adjustment().response());
    }

    @Test
    void customerHistoryMarksOlderSupersededRevisionAsReplacedAfterNextRevisionWasSent() {
        Quotation first = mock(Quotation.class);
        Quotation second = mock(Quotation.class);
        JobCase jobCase = mock(JobCase.class);
        CustomerRequest request = mock(CustomerRequest.class);
        Customer customer = mock(Customer.class);

        when(quotationRepository.findDetailById(2L)).thenReturn(Optional.of(second));
        when(second.getJobCase()).thenReturn(jobCase);
        when(first.getJobCase()).thenReturn(jobCase);
        when(jobCase.getCustomerRequest()).thenReturn(request);
        when(request.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(20L);
        when(second.getSentAt()).thenReturn(Instant.now());
        when(second.getQuotationNumber()).thenReturn("QT-00000001");

        when(quotationRepository.findAllByQuotationNumberOrderByRevisionDesc("QT-00000001"))
                .thenReturn(List.of(second, first));

        when(second.getRevision()).thenReturn(2);
        when(second.getStatus()).thenReturn(QuotationStatus.SENT);

        when(first.getRevision()).thenReturn(1);
        when(first.getStatus()).thenReturn(QuotationStatus.SUPERSEDED);
        when(first.getSentAt()).thenReturn(Instant.now());

        var response = service.listRevisionsForCustomer(42L, 20L, 2L);

        assertEquals(2, response.size());
        assertEquals(CustomerQuotationStatus.SENT, response.get(0).customerStatus());
        assertEquals(CustomerQuotationStatus.REPLACED, response.get(1).customerStatus());
    }

    @Test
    void customerListUsesLatestNonDraftRevisionOfEachQuotationFlow() {
        when(quotationRepository.findLatestVisibleRevisionsForCustomer(20L))
                .thenReturn(List.of());

        var response = service.listForCustomer(42L, 20L);

        assertTrue(response.isEmpty());
        verify(accessPolicy).requireCustomerReader(42L, 20L);
        verify(quotationRepository).findLatestVisibleRevisionsForCustomer(20L);
    }
}
