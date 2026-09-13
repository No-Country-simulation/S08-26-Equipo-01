package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocumentForm;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.JobCaseSummaryResponse;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerRequestSubmissionServiceTest {

    @Mock CustomerRequestService customerRequestService;
    @Mock DocumentService documentService;

    private CustomerRequestSubmissionService service;

    @BeforeEach
    void setUp() {
        service = new CustomerRequestSubmissionService(customerRequestService, documentService, 5);
    }

    @Test
    void createsEachInitialDocumentFromItsOwnMetadataAndFile() {
        SubmitCustomerRequest input = validInput();
        when(customerRequestService.submit(10L, 20L, input)).thenReturn(submittedResponse());

        MockMultipartFile file = new MockMultipartFile(
                "documents[0].file", "plano.pdf", "application/pdf", new byte[]{1, 2, 3}
        );
        CreateRequestDocumentForm document = new CreateRequestDocumentForm();
        document.setDocumentType(" TECHNICAL_DRAWING ");
        document.setName(" Plano técnico ");
        document.setDescription("Plano para cotización");
        document.setFile(file);

        service.submit(10L, 20L, input, List.of(document));

        verify(documentService).create(
                10L,
                new CreateDocumentRequest(
                        73L,
                        "TECHNICAL_DRAWING",
                        "Plano técnico",
                        "Plano para cotización"
                ),
                file
        );
    }

    @Test
    void appliesDefaultsInsideTheSameDocumentObject() {
        SubmitCustomerRequest input = validInput();
        when(customerRequestService.submit(10L, 20L, input)).thenReturn(submittedResponse());

        MockMultipartFile file = new MockMultipartFile(
                "documents[0].file", "plano.pdf", "application/pdf", new byte[]{1}
        );
        CreateRequestDocumentForm document = new CreateRequestDocumentForm();
        document.setFile(file);

        service.submit(10L, 20L, input, List.of(document));

        verify(documentService).create(
                10L,
                new CreateDocumentRequest(73L, "REQUEST_ATTACHMENT", "plano.pdf", null),
                file
        );
    }

    @Test
    void rejectsDocumentWithoutFileBeforeCreatingRequest() {
        CreateRequestDocumentForm document = new CreateRequestDocumentForm();
        document.setDocumentType("TECHNICAL_DRAWING");

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.submit(10L, 20L, validInput(), List.of(document))
        );

        assertEquals(ApiErrorCode.VALIDATION_ERROR, exception.getCode());
        verifyNoInteractions(customerRequestService, documentService);
    }

    @Test
    void rejectsTooManyDocumentsBeforeCreatingRequest() {
        MockMultipartFile file = new MockMultipartFile(
                "documents[0].file", "plano.pdf", "application/pdf", new byte[]{1}
        );
        CreateRequestDocumentForm document = new CreateRequestDocumentForm();
        document.setFile(file);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.submit(
                        10L,
                        20L,
                        validInput(),
                        List.of(document, document, document, document, document, document)
                )
        );

        assertEquals(ApiErrorCode.VALIDATION_ERROR, exception.getCode());
        verifyNoInteractions(customerRequestService, documentService);
    }

    private SubmitCustomerRequest validInput() {
        return new SubmitCustomerRequest(
                "OC-4587",
                "Eje de transmisión",
                "Fabricar conforme al plano proporcionado.",
                25,
                MaterialRequirementType.SPECIFIED,
                "AISI 4140",
                LocalDate.now().plusDays(30)
        );
    }

    private CustomerRequestResponse submittedResponse() {
        Instant now = Instant.now();
        return new CustomerRequestResponse(
                31L,
                20L,
                "REQ-00000001",
                "OC-4587",
                "Eje de transmisión",
                "Fabricar conforme al plano proporcionado.",
                25,
                MaterialRequirementType.SPECIFIED,
                "AISI 4140",
                LocalDate.now().plusDays(30),
                10L,
                "Ana López",
                now,
                now,
                new JobCaseSummaryResponse(
                        73L,
                        "CASE-00000001",
                        JobCaseStatus.SUBMITTED,
                        null,
                        null,
                        now,
                        null,
                        null,
                        null
                )
        );
    }
}
