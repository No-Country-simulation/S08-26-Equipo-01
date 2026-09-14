package com.nocountry.qualitytrack.requests.entity;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.users.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(MockitoExtension.class)
class CaseInformationRequestTest {

    @Mock
    private Customer customer;

    @Mock
    private User requester;

    @Mock
    private User commercial;

    @Test
    void pendingClarificationStopsBeingOpenWhenCaseIsCancelled() {
        CustomerRequest request = CustomerRequest.submit(
                customer,
                "REQ-00000001",
                null,
                "Eje de transmisión",
                "Fabricar conforme al plano.",
                25,
                MaterialRequirementType.SPECIFIED,
                "AISI 4140",
                LocalDate.of(2026, 10, 15),
                requester
        );
        JobCase jobCase = JobCase.open(request, "CASE-00000001", Instant.now().minusSeconds(60));
        jobCase.takeForReview(commercial, Instant.now().minusSeconds(30));

        CaseInformationRequest informationRequest = CaseInformationRequest.open(
                jobCase,
                "¿Puede confirmar la tolerancia?",
                commercial,
                Instant.now().minusSeconds(20)
        );
        jobCase.waitForCustomerInfo();

        assertTrue(informationRequest.isOpen());

        jobCase.cancel(requester, "Solicitud cancelada por el cliente.", Instant.now());

        assertFalse(informationRequest.isOpen());
    }
}
