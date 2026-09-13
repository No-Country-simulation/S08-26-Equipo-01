package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.documents.storage.DocumentStorage;
import com.nocountry.qualitytrack.documents.storage.StoredDocumentFile;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    @Mock
    private DocumentVersionRepository documentVersionRepository;

    @Mock
    private JobCaseRepository jobCaseRepository;

    @Mock
    private DocumentAccessService accessService;

    @Mock
    private DocumentStorage storage;

    @Mock
    private JobCase jobCase;

    @Mock
    private CustomerRequest customerRequest;

    @Mock
    private Customer customer;

    @Mock
    private User user;

    private DocumentService service;

    @BeforeEach
    void setUp() {
        service = new DocumentService(
                documentRepository,
                documentVersionRepository,
                jobCaseRepository,
                accessService,
                storage
        );
    }

    @Test
    void createsDocumentWithVersionOne() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano.pdf",
                "application/pdf",
                "contenido".getBytes()
        );

        stubCaseCustomer();
        when(jobCaseRepository.findById(12L)).thenReturn(Optional.of(jobCase));
        when(accessService.requireCanCreate(10L, jobCase)).thenReturn(user);
        when(user.getId()).thenReturn(10L);
        when(user.getFirstName()).thenReturn("Ana");
        when(user.getLastName()).thenReturn("López");
        when(documentRepository.saveAndFlush(any(Document.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(storage.store(
                eq(20L),
                eq(12L),
                eq(1),
                eq("plano.pdf"),
                any(InputStream.class)
        )).thenReturn(new StoredDocumentFile(
                "qualitytrack/20/case-12/v1-test.pdf",
                9L,
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        ));
        when(documentVersionRepository.saveAndFlush(any(DocumentVersion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DocumentResponse response = service.create(
                10L,
                new CreateDocumentRequest(12L, " drawing ", " Plano de eje ", " Referencia "),
                file
        );

        assertEquals("DRAWING", response.documentType());
        assertEquals("Plano de eje", response.name());
        assertEquals(1, response.currentVersion().version());
        assertEquals("plano.pdf", response.currentVersion().fileName());
    }

    @Test
    void addsNextVersionWithoutReplacingPreviousOne() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano-rev-b.pdf",
                "application/pdf",
                "revision".getBytes()
        );
        Document document = Document.create(jobCase, "DRAWING", "Plano", null, user);

        stubCaseCustomer();
        when(documentRepository.findByIdAndCaseIdAndStatusForUpdate(
                7L,
                12L,
                DocumentStatus.ACTIVE
        )).thenReturn(Optional.of(document));
        when(accessService.requireCanAddVersion(10L, document)).thenReturn(user);
        when(documentVersionRepository.findMaxVersionByDocumentId(7L)).thenReturn(1);
        when(storage.store(
                eq(20L),
                eq(12L),
                eq(2),
                eq("plano-rev-b.pdf"),
                any(InputStream.class)
        )).thenReturn(new StoredDocumentFile(
                "qualitytrack/20/case-12/v2-test.pdf",
                8L,
                "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789"
        ));
        when(documentVersionRepository.saveAndFlush(any(DocumentVersion.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DocumentVersionResponse response = service.addVersion(10L, 12L, 7L, file);

        assertEquals(2, response.version());
        assertEquals("plano-rev-b.pdf", response.fileName());
    }

    @Test
    void rejectsDocumentFromDifferentCaseWhenAddingVersion() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "plano-rev-b.pdf",
                "application/pdf",
                "revision".getBytes()
        );

        when(documentRepository.findByIdAndCaseIdAndStatusForUpdate(
                7L,
                12L,
                DocumentStatus.ACTIVE
        )).thenReturn(Optional.empty());

        assertThrows(
                RuntimeException.class,
                () -> service.addVersion(10L, 12L, 7L, file)
        );
    }

    @Test
    void customerDetailOnlyIncludesActiveCustomerDocumentsWithCurrentVersion() {
        Document customerDocument = mock(Document.class);
        Document internalDocument = mock(Document.class);
        DocumentVersion latestVersion = mock(DocumentVersion.class);
        User internalCreator = mock(User.class);

        when(jobCaseRepository.findById(12L)).thenReturn(Optional.of(jobCase));
        when(accessService.requireCanReadCase(10L, jobCase)).thenReturn(user);
        when(user.getAccountType()).thenReturn(AccountType.CUSTOMER);
        when(customerDocument.getCreatedBy()).thenReturn(user);
        when(internalDocument.getCreatedBy()).thenReturn(internalCreator);
        when(internalCreator.getAccountType()).thenReturn(AccountType.INTERNAL);
        when(documentRepository.findAllByJobCase_IdAndStatusOrderByCreatedAtAsc(
                12L,
                DocumentStatus.ACTIVE
        )).thenReturn(List.of(customerDocument, internalDocument));

        when(customerDocument.getId()).thenReturn(7L);
        when(customerDocument.getJobCase()).thenReturn(jobCase);
        when(customerDocument.getDocumentType()).thenReturn("DRAWING");
        when(customerDocument.getName()).thenReturn("Plano cliente");
        when(customerDocument.getDescription()).thenReturn(null);
        when(customerDocument.getCreatedAt()).thenReturn(Instant.parse("2026-09-10T23:40:00Z"));
        when(user.getId()).thenReturn(10L);
        when(user.getFirstName()).thenReturn("Ana");
        when(user.getLastName()).thenReturn("López");

        when(documentVersionRepository.findLatestByDocumentIds(List.of(7L)))
                .thenReturn(List.of(latestVersion));
        when(latestVersion.getDocument()).thenReturn(customerDocument);
        when(latestVersion.getId()).thenReturn(21L);
        when(latestVersion.getVersion()).thenReturn(2);
        when(latestVersion.getFileName()).thenReturn("plano-v2.pdf");
        when(latestVersion.getMimeType()).thenReturn("application/pdf");
        when(latestVersion.getFileSize()).thenReturn(100L);
        when(latestVersion.getChecksum()).thenReturn(
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
        );
        when(latestVersion.getUploadedBy()).thenReturn(user);
        when(latestVersion.getUploadedAt()).thenReturn(Instant.parse("2026-09-10T23:50:00Z"));
        when(jobCase.getId()).thenReturn(12L);

        List<DocumentResponse> response = service.listCurrentByCase(10L, 12L);

        assertEquals(1, response.size());
        assertEquals("Plano cliente", response.get(0).name());
        assertEquals(2, response.get(0).currentVersion().version());
    }

    @Test
    void removesDocumentLogicallyWithoutDeletingStoredFile() {
        Document document = Document.create(jobCase, "DRAWING", "Plano", null, user);

        when(documentRepository.findByIdAndCaseIdAndStatusForUpdate(
                7L,
                12L,
                DocumentStatus.ACTIVE
        )).thenReturn(Optional.of(document));
        when(accessService.requireCanRemove(10L, document)).thenReturn(user);
        when(documentRepository.saveAndFlush(document)).thenReturn(document);

        service.remove(10L, 12L, 7L);

        assertEquals(DocumentStatus.REMOVED, document.getStatus());
        assertSame(user, document.getRemovedBy());
        assertNotNull(document.getRemovedAt());
        verify(documentRepository).saveAndFlush(document);
        verifyNoInteractions(storage);
    }

    private void stubCaseCustomer() {
        when(jobCase.getId()).thenReturn(12L);
        when(jobCase.getCustomerRequest()).thenReturn(customerRequest);
        when(customerRequest.getCustomer()).thenReturn(customer);
        when(customer.getId()).thenReturn(20L);
    }
}
