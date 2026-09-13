package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.dto.response.DocumentResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.service.DocumentDownload;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocument;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentVersionResponse;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerRequestDocumentService {

    private static final String DEFAULT_DOCUMENT_TYPE = "REQUEST_ATTACHMENT";
    private static final String DEFAULT_DOCUMENT_NAME = "Documento adjunto";

    private final JobCaseRepository jobCaseRepository;
    private final DocumentService documentService;

    @Transactional
    public RequestDocumentResponse create(
            Long currentUserId,
            Long customerId,
            Long requestId,
            CreateRequestDocument metadata,
            MultipartFile file
    ) {
        JobCase jobCase = requireJobCase(customerId, requestId);
        DocumentResponse document = documentService.create(
                currentUserId,
                new CreateDocumentRequest(
                        jobCase.getId(),
                        documentType(metadata),
                        documentName(metadata, file),
                        metadata == null ? null : metadata.description()
                ),
                file
        );

        return RequestDocumentResponse.from(document, customerId, requestId);
    }

    @Transactional(readOnly = true)
    public List<RequestDocumentResponse> listCurrent(
            Long currentUserId,
            JobCase jobCase
    ) {
        Long customerId = jobCase.getCustomerRequest().getCustomer().getId();
        Long requestId = jobCase.getCustomerRequest().getId();

        return documentService.listCurrentByCase(currentUserId, jobCase.getId())
                .stream()
                .map(document -> RequestDocumentResponse.from(document, customerId, requestId))
                .toList();
    }

    @Transactional
    public RequestDocumentVersionResponse addVersion(
            Long currentUserId,
            Long customerId,
            Long requestId,
            Long documentId,
            MultipartFile file
    ) {
        JobCase jobCase = requireJobCase(customerId, requestId);
        DocumentVersionResponse version = documentService.addVersion(
                currentUserId,
                jobCase.getId(),
                documentId,
                file
        );

        return RequestDocumentVersionResponse.from(
                version,
                customerId,
                requestId,
                documentId
        );
    }

    @Transactional(readOnly = true)
    public List<RequestDocumentVersionResponse> listVersions(
            Long currentUserId,
            Long customerId,
            Long requestId,
            Long documentId
    ) {
        JobCase jobCase = requireJobCase(customerId, requestId);
        return documentService.listVersions(
                        currentUserId,
                        jobCase.getId(),
                        documentId
                )
                .stream()
                .map(version -> RequestDocumentVersionResponse.from(
                        version,
                        customerId,
                        requestId,
                        documentId
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentDownload download(
            Long currentUserId,
            Long customerId,
            Long requestId,
            Long documentId,
            Long versionId
    ) {
        JobCase jobCase = requireJobCase(customerId, requestId);
        return documentService.download(
                currentUserId,
                jobCase.getId(),
                documentId,
                versionId
        );
    }

    @Transactional
    public void remove(
            Long currentUserId,
            Long customerId,
            Long requestId,
            Long documentId
    ) {
        JobCase jobCase = requireJobCase(customerId, requestId);
        documentService.remove(currentUserId, jobCase.getId(), documentId);
    }

    private JobCase requireJobCase(Long customerId, Long requestId) {
        return jobCaseRepository
                .findByCustomerRequest_IdAndCustomerRequest_Customer_Id(requestId, customerId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la solicitud."
                ));
    }

    private String documentType(CreateRequestDocument metadata) {
        if (metadata == null
                || metadata.documentType() == null
                || metadata.documentType().isBlank()) {
            return DEFAULT_DOCUMENT_TYPE;
        }
        return metadata.documentType().trim();
    }

    private String documentName(CreateRequestDocument metadata, MultipartFile file) {
        if (metadata != null && metadata.name() != null && !metadata.name().isBlank()) {
            return metadata.name().trim();
        }

        if (file == null || file.getOriginalFilename() == null) {
            return DEFAULT_DOCUMENT_NAME;
        }

        String normalized = file.getOriginalFilename()
                .replace('\\', '/')
                .replace("\r", "")
                .replace("\n", "")
                .trim();

        int separator = normalized.lastIndexOf('/');
        String fileName = separator >= 0
                ? normalized.substring(separator + 1).trim()
                : normalized;

        return fileName.isBlank() ? DEFAULT_DOCUMENT_NAME : fileName;
    }
}
