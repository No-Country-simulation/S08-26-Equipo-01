package com.nocountry.qualitytrack.materials.service;

import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.documents.repository.DocumentRepository;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.documents.service.DocumentAccessService;
import com.nocountry.qualitytrack.documents.storage.DocumentStorage;
import com.nocountry.qualitytrack.documents.storage.DocumentStorageException;
import com.nocountry.qualitytrack.documents.storage.StoredDocumentFile;
import com.nocountry.qualitytrack.materials.entity.Material;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class MaterialReferenceDocumentService {

    private static final String DOCUMENT_TYPE = "MATERIAL_TECHNICAL_SHEET";
    private static final String DEFAULT_MIME_TYPE = "application/octet-stream";

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final DocumentAccessService accessService;
    private final DocumentStorage storage;

    @Transactional
    public DocumentVersion upsertTechnicalSheet(
            Long currentUserId,
            Material material,
            MultipartFile file
    ) {
        validateFile(file);
        User uploader = accessService.requireMaterialCertificateWriter(currentUserId);

        Document document = documentRepository
                .findByMaterialAndTypeAndStatusForUpdate(
                        material.getId(),
                        DOCUMENT_TYPE,
                        DocumentStatus.ACTIVE
                )
                .orElse(null);

        int nextVersion;
        if (document == null) {
            document = Document.createForMaterial(
                    material,
                    DOCUMENT_TYPE,
                    "Ficha técnica · " + material.getCode(),
                    "Documento técnico de referencia del material " + material.getCode() + ".",
                    uploader
            );
            document = documentRepository.saveAndFlush(document);
            nextVersion = 1;
        } else {
            nextVersion = documentVersionRepository.findMaxVersionByDocumentId(document.getId()) + 1;
        }

        String fileName = sanitizeFileName(file.getOriginalFilename());
        StoredDocumentFile storedFile = storeFile(material, nextVersion, fileName, file);
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
        return documentVersionRepository.saveAndFlush(version);
    }

    private StoredDocumentFile storeFile(
            Material material,
            int version,
            String fileName,
            MultipartFile file
    ) {
        try (InputStream inputStream = file.getInputStream()) {
            return storage.storeMaterial(
                    material.getId(),
                    version,
                    fileName,
                    inputStream
            );
        } catch (IOException | DocumentStorageException exception) {
            throw new BusinessException(
                    ApiErrorCode.DOCUMENT_STORAGE_ERROR,
                    "No fue posible almacenar la ficha técnica del material.",
                    exception
            );
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
