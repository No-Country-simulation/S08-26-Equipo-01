package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.requests.repository.CaseInformationRequestRepository;
import com.nocountry.qualitytrack.requests.repository.CaseMaterialSpecificationRepository;
import com.nocountry.qualitytrack.requests.service.CustomerRequestDocumentService;
import com.nocountry.qualitytrack.users.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuotationSourceServiceTest {

    @Mock
    private CustomerRequestDocumentService customerRequestDocumentService;
    @Mock
    private CaseInformationRequestRepository informationRequestRepository;
    @Mock
    private CaseMaterialSpecificationRepository materialSpecificationRepository;

    @InjectMocks
    private QuotationSourceService service;

    @Test
    void sourceContainsCustomerRequestContextUsedToBuildQuotation() {
        Quotation quotation = mock(Quotation.class);
        JobCase jobCase = mock(JobCase.class);
        CustomerRequest request = mock(CustomerRequest.class);
        Customer customer = mock(Customer.class);
        User requester = mock(User.class);

        when(quotation.getJobCase()).thenReturn(jobCase);
        when(jobCase.getId()).thenReturn(3L);
        when(jobCase.getCaseNumber()).thenReturn("CASE-00000003");
        when(jobCase.getCustomerRequest()).thenReturn(request);

        when(request.getId()).thenReturn(3L);
        when(request.getRequestNumber()).thenReturn("REQ-00000003");
        when(request.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(1L);
        when(customer.getName()).thenReturn("Cambers SA de Cv");
        when(request.getCustomerReference()).thenReturn("OC-145");
        when(request.getTitle()).thenReturn("Fabricación de ejes");
        when(request.getDescription()).thenReturn("Fabricar conforme al plano adjunto.");
        when(request.getQuantity()).thenReturn(25);
        when(request.getMaterialRequirementType()).thenReturn(MaterialRequirementType.SPECIFIED);
        when(request.getMaterialRequirement()).thenReturn("AISI 4140");
        when(request.getRequestedDeliveryDate()).thenReturn(LocalDate.of(2026, 10, 2));
        when(request.getRequestedByUser()).thenReturn(requester);
        when(requester.getId()).thenReturn(42L);
        when(requester.getFirstName()).thenReturn("Edgar");
        when(requester.getLastName()).thenReturn("Camberos");

        when(customerRequestDocumentService.listCurrent(10L, jobCase))
                .thenReturn(List.of());
        when(informationRequestRepository.findAllByJobCase_IdOrderByRequestedAtAsc(3L))
                .thenReturn(List.of());
        when(materialSpecificationRepository.findByJobCase_Id(3L))
                .thenReturn(Optional.empty());

        var source = service.get(10L, quotation);

        assertEquals("Fabricación de ejes", source.title());
        assertEquals("Fabricar conforme al plano adjunto.", source.description());
        assertEquals(25, source.quantity());
        assertEquals("AISI 4140", source.materialRequirement());
        assertEquals(LocalDate.of(2026, 10, 2), source.requestedDeliveryDate());
        assertEquals("Edgar Camberos", source.requestedByName());
        assertTrue(source.documents().isEmpty());
        assertTrue(source.informationRequests().isEmpty());
    }
}
