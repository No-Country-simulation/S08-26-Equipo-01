package com.nocountry.qualitytrack.documents.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.documents.storage.DocumentStorage;
import com.nocountry.qualitytrack.documents.storage.DocumentStorageException;
import com.nocountry.qualitytrack.documents.storage.StoredDocumentFile;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DocumentService {

    private static final String DEFAULT_MIME_TYPE = "application/octet-stream";

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final JobCaseRepository jobCaseRepository;
    private final DocumentAccessService accessService;
    private final DocumentStorage storage;

    @Transactional
    public DocumentResponse create(
            Long currentUserId,
            CreateDocumentRequest input,
            MultipartFile file
    ) {
        validateFile(file);

        JobCase jobCase = requireJobCase(input.caseId());
        User uploader = accessService.requireCanCreate(currentUserId, jobCase);

        Document document = Document.create(
                jobCase,
                input.documentType().trim().toUpperCase(Locale.ROOT),
                input.name().trim(),
                normalizeNullable(input.description()),
                uploader
        );
        document = documentRepository.saveAndFlush(document);

        String fileName = sanitizeFileName(file.getOriginalFilename());
        String mimeType = normalizeMimeType(file.getContentType());
        StoredDocumentFile storedFile = storeFile(jobCase, 1, fileName, file);
        registerRollbackCleanup(storedFile.storageKey());

        DocumentVersion version = DocumentVersion.upload(
                document,
                1,
                fileName,
                storedFile.storageKey(),
                mimeType,
                storedFile.fileSize(),
                storedFile.checksum(),
                uploader
        );
        version = documentVersionRepository.saveAndFlush(version);

        return DocumentResponse.from(document, version);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> listCurrentByCase(Long currentUserId, Long caseId) {
        JobCase jobCase = requireJobCase(caseId);
        User viewer = accessService.requireCanReadCase(currentUserId, jobCase);

        List<Document> documents = documentRepository
                .findAllByJobCase_IdAndStatusOrderByCreatedAtAsc(caseId, DocumentStatus.ACTIVE)
                .stream()
                .filter(document -> viewer.getAccountType() == AccountType.INTERNAL
                        || document.getCreatedBy().getAccountType() == AccountType.CUSTOMER)
                .toList();

        if (documents.isEmpty()) {
            return List.of();
        }

        List<Long> documentIds = documents.stream()
                .map(Document::getId)
                .toList();

        Map<Long, DocumentVersion> latestVersions = documentVersionRepository
                .findLatestByDocumentIds(documentIds)
                .stream()
                .collect(Collectors.toMap(
                        version -> version.getDocument().getId(),
                        Function.identity()
                ));

        return documents.stream()
                .map(document -> DocumentResponse.from(
                        document,
                        requireLatestVersion(document, latestVersions)
                ))
                .toList();
    }

    @Transactional
    public DocumentVersionResponse addVersion(
            Long currentUserId,
            Long caseId,
            Long documentId,
            MultipartFile file
    ) {
        validateFile(file);

        Document document = documentRepository
                .findByIdAndCaseIdAndStatusForUpdate(documentId, caseId, DocumentStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el documento activo dentro del expediente."
                ));

        User uploader = accessService.requireCanAddVersion(currentUserId, document);
        int nextVersion = documentVersionRepository.findMaxVersionByDocumentId(documentId) + 1;
        String fileName = sanitizeFileName(file.getOriginalFilename());

        StoredDocumentFile storedFile = storeFile(
                document.getJobCase(),
                nextVersion,
                fileName,
                file
        );
        registerRollbackCleanup(storedFile.storageKey());

        DocumentVersion version = DocumentVersion.upload(
                document,
                nextVersion,
                fileName,
                storedFile.storageKey(),
                normalizeMimeType(file.getContentType()),
                storedFile.fileSize(),
                storedFile.checksum(),
                uploader
        );
        version = documentVersionRepository.saveAndFlush(version);

        return DocumentVersionResponse.from(version);
    }

    @Transactional(readOnly = true)
    public List<DocumentVersionResponse> listVersions(
            Long currentUserId,
            Long caseId,
            Long documentId
    ) {
        Document document = requireActiveDocument(caseId, documentId);
        accessService.requireCanRead(currentUserId, document);

        return documentVersionRepository.findAllByDocument_IdOrderByVersionAsc(documentId)
                .stream()
                .map(DocumentVersionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentDownload download(
            Long currentUserId,
            Long caseId,
            Long documentId,
            Long versionId
    ) {
        DocumentVersion version = documentVersionRepository
                .findByIdAndDocument_IdAndDocument_JobCase_IdAndDocument_Status(
                        versionId,
                        documentId,
                        caseId,
                        DocumentStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la versión del documento activo dentro del expediente."
                ));

        accessService.requireCanRead(currentUserId, version.getDocument());

        try {
            Resource resource = storage.load(version.getStorageKey());
            long fileSize = version.getFileSize() == null
                    ? resource.contentLength()
                    : version.getFileSize();

            return new DocumentDownload(
                    resource,
                    version.getFileName(),
                    version.getMimeType(),
                    fileSize
            );
        } catch (IOException | DocumentStorageException exception) {
            throw storageUnavailable();
        }
    }

    @Transactional
    public void remove(
            Long currentUserId,
            Long caseId,
            Long documentId
    ) {
        Document document = documentRepository
                .findByIdAndCaseIdAndStatusForUpdate(documentId, caseId, DocumentStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el documento activo dentro del expediente."
                ));

        User remover = accessService.requireCanRemove(currentUserId, document);
        document.remove(remover, Instant.now());
        documentRepository.saveAndFlush(document);
    }

    private JobCase requireJobCase(Long caseId) {
        return jobCaseRepository.findById(caseId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el expediente."
                ));
    }

    private Document requireActiveDocument(Long caseId, Long documentId) {
        return documentRepository
                .findByIdAndJobCase_IdAndStatus(documentId, caseId, DocumentStatus.ACTIVE)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el documento activo dentro del expediente."
                ));
    }

    private DocumentVersion requireLatestVersion(
            Document document,
            Map<Long, DocumentVersion> latestVersions
    ) {
        DocumentVersion version = latestVersions.get(document.getId());
        if (version == null) {
            throw new BusinessException(
                    ApiErrorCode.DATA_CONFLICT,
                    "El documento no tiene una versión disponible."
            );
        }
        return version;
    }

    private StoredDocumentFile storeFile(
            JobCase jobCase,
            Integer version,
            String fileName,
            MultipartFile file
    ) {
        Long customerId = jobCase.getCustomerRequest().getCustomer().getId();

        try (InputStream inputStream = file.getInputStream()) {
            return storage.store(
                    customerId,
                    jobCase.getId(),
                    version,
                    fileName,
                    inputStream
            );
        } catch (IOException | DocumentStorageException exception) {
            throw storageUnavailable();
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(
                    ApiErrorCode.DOCUMENT_FILE_REQUIRED,
                    "Debes adjuntar un archivo no vacío."
            );
        }

        sanitizeFileName(file.getOriginalFilename());
    }

    private String sanitizeFileName(String originalFileName) {
        if (originalFileName == null) {
            throw invalidFileName();
        }

        String normalized = originalFileName
                .replace('\\', '/')
                .replace("\r", "")
                .replace("\n", "")
                .trim();

        int separator = normalized.lastIndexOf('/');
        String fileName = separator >= 0
                ? normalized.substring(separator + 1).trim()
                : normalized;

        if (fileName.isBlank() || fileName.length() > 255) {
            throw invalidFileName();
        }

        return fileName;
    }

    private BusinessException invalidFileName() {
        return new BusinessException(
                ApiErrorCode.VALIDATION_ERROR,
                "El nombre del archivo no es válido."
        );
    }

    private String normalizeMimeType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return DEFAULT_MIME_TYPE;
        }

        String normalized = contentType.trim();
        return normalized.length() <= 150 ? normalized : DEFAULT_MIME_TYPE;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private BusinessException storageUnavailable() {
        return new BusinessException(
                ApiErrorCode.DOCUMENT_STORAGE_ERROR,
                "No fue posible acceder al almacenamiento de documentos."
        );
    }

    private void registerRollbackCleanup(String storageKey) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != TransactionSynchronization.STATUS_COMMITTED) {
                    storage.deleteQuietly(storageKey);
                }
            }
        });
    }
}
