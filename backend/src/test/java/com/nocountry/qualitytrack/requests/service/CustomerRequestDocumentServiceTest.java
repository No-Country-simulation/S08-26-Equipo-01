package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocument;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentVersionResponse;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomerRequestDocumentServiceTest {

    @Mock
    private JobCaseRepository jobCaseRepository;

    @Mock
    private DocumentService documentService;

    @Mock
    private JobCase jobCase;

    @Mock
    private DocumentResponse documentResponse;

    @Mock
    private DocumentVersionResponse versionResponse;

    private CustomerRequestDocumentService service;

    @BeforeEach
    void setUp() {
        service = new CustomerRequestDocumentService(
                jobCaseRepository,
                documentService
        );
    }

    @Test
    void createsDocumentUsingCaseResolvedFromRequestAndReturnsContextualUrls() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano.pdf",
                "application/pdf",
                "drawing".getBytes()
        );

        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(31L, 20L))
                .thenReturn(Optional.of(jobCase));
        when(jobCase.getId()).thenReturn(73L);
        when(documentService.create(
                10L,
                new CreateDocumentRequest(
                        73L,
                        "REQUEST_ATTACHMENT",
                        "plano.pdf",
                        null
                ),
                file
        )).thenReturn(documentResponse);
        stubDocumentResponse();

        RequestDocumentResponse result = service.create(
                10L,
                20L,
                31L,
                null,
                file
        );

        assertEquals(7L, result.id());
        assertEquals(
                "/api/v1/customers/20/requests/31/documents/7/versions/21/content",
                result.currentVersion().contentUrl()
        );
        assertEquals(
                "/api/v1/customers/20/requests/31/documents/7/versions/21/content?download=true",
                result.currentVersion().downloadUrl()
        );
    }

    @Test
    void usesExplicitMetadataWithoutExposingCaseIdToClient() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "archivo.bin",
                "application/octet-stream",
                "content".getBytes()
        );
        CreateRequestDocument metadata = new CreateRequestDocument(
                " DRAWING ",
                " Plano aprobado ",
                " Revisión inicial "
        );

        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(31L, 20L))
                .thenReturn(Optional.of(jobCase));
        when(jobCase.getId()).thenReturn(73L);
        when(documentService.create(
                10L,
                new CreateDocumentRequest(
                        73L,
                        "DRAWING",
                        "Plano aprobado",
                        " Revisión inicial "
                ),
                file
        )).thenReturn(documentResponse);
        stubDocumentResponse();

        RequestDocumentResponse result = service.create(
                10L,
                20L,
                31L,
                metadata,
                file
        );

        assertEquals("Plano de eje", result.name());
    }

    @Test
    void forwardsCaseContextWhenAddingVersionAndBuildsUrls() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano-v2.pdf",
                "application/pdf",
                "revision".getBytes()
        );

        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(31L, 20L))
                .thenReturn(Optional.of(jobCase));
        when(jobCase.getId()).thenReturn(73L);
        when(documentService.addVersion(10L, 73L, 7L, file))
                .thenReturn(versionResponse);
        stubVersionResponse();

        RequestDocumentVersionResponse result = service.addVersion(
                10L,
                20L,
                31L,
                7L,
                file
        );

        assertEquals(
                "/api/v1/customers/20/requests/31/documents/7/versions/21/content",
                result.contentUrl()
        );
    }

    @Test
    void removesDocumentOnlyAfterResolvingRequestContext() {
        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(31L, 20L))
                .thenReturn(Optional.of(jobCase));
        when(jobCase.getId()).thenReturn(73L);

        service.remove(10L, 20L, 31L, 7L);

        verify(documentService).remove(10L, 73L, 7L);
    }

    @Test
    void rejectsRequestOutsideCustomerContextBeforeTouchingDocuments() {
        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(31L, 20L))
                .thenReturn(Optional.empty());

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.remove(10L, 20L, 31L, 7L)
        );

        assertEquals(ApiErrorCode.RESOURCE_NOT_FOUND, exception.getCode());
        verify(documentService, never()).remove(10L, 73L, 7L);
    }

    private void stubDocumentResponse() {
        stubVersionResponse();
        when(documentResponse.id()).thenReturn(7L);
        when(documentResponse.documentType()).thenReturn("DRAWING");
        when(documentResponse.name()).thenReturn("Plano de eje");
        when(documentResponse.description()).thenReturn("Plano recibido del cliente");
        when(documentResponse.createdByUserId()).thenReturn(42L);
        when(documentResponse.createdByName()).thenReturn("Ana López");
        when(documentResponse.createdAt()).thenReturn(Instant.parse("2026-09-10T23:40:00Z"));
        when(documentResponse.currentVersion()).thenReturn(versionResponse);
    }

    private void stubVersionResponse() {
        when(versionResponse.id()).thenReturn(21L);
        when(versionResponse.version()).thenReturn(1);
        when(versionResponse.fileName()).thenReturn("plano.pdf");
        when(versionResponse.mimeType()).thenReturn("application/pdf");
        when(versionResponse.fileSize()).thenReturn(245812L);
        when(versionResponse.checksum()).thenReturn(
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        when(versionResponse.uploadedByUserId()).thenReturn(42L);
        when(versionResponse.uploadedByName()).thenReturn("Ana López");
        when(versionResponse.uploadedAt()).thenReturn(Instant.parse("2026-09-10T23:40:00Z"));
    }
}
