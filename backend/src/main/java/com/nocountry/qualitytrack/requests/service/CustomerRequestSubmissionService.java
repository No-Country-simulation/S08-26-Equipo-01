package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.documents.dto.request.CreateDocumentRequest;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocumentForm;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class CustomerRequestSubmissionService {

    private static final String DEFAULT_DOCUMENT_TYPE = "REQUEST_ATTACHMENT";
    private static final String DEFAULT_DOCUMENT_NAME = "Documento adjunto";

    private final CustomerRequestService customerRequestService;
    private final DocumentService documentService;
    private final int maxFilesPerRequest;

    public CustomerRequestSubmissionService(
            CustomerRequestService customerRequestService,
            DocumentService documentService,
            @Value("${app.documents.max-files-per-request:5}") int maxFilesPerRequest
    ) {
        if (maxFilesPerRequest < 1) {
            throw new IllegalStateException("DOCUMENT_MAX_FILES_PER_REQUEST must be greater than zero.");
        }
        this.customerRequestService = customerRequestService;
        this.documentService = documentService;
        this.maxFilesPerRequest = maxFilesPerRequest;
    }

    @Transactional
    public CustomerRequestResponse submit(
            Long currentUserId,
            Long customerId,
            SubmitCustomerRequest input,
            List<CreateRequestDocumentForm> documents
    ) {
        validateDocuments(documents);

        CustomerRequestResponse response = customerRequestService.submit(currentUserId, customerId, input);
        if (documents == null || documents.isEmpty()) {
            return response;
        }

        Long caseId = response.jobCase().id();
        for (CreateRequestDocumentForm document : documents) {
            MultipartFile file = document.getFile();
            documentService.create(
                    currentUserId,
                    new CreateDocumentRequest(
                            caseId,
                            resolveDocumentType(document),
                            resolveDocumentName(document, file),
                            document.getDescription()
                    ),
                    file
            );
        }

        return response;
    }

    private void validateDocuments(List<CreateRequestDocumentForm> documents) {
        if (documents == null) {
            return;
        }
        if (documents.size() > maxFilesPerRequest) {
            throw new BusinessException(
                    ApiErrorCode.VALIDATION_ERROR,
                    "Puedes adjuntar como máximo " + maxFilesPerRequest + " documentos por solicitud."
            );
        }
        if (documents.stream().anyMatch(document -> document == null || document.getFile() == null)) {
            throw new BusinessException(
                    ApiErrorCode.VALIDATION_ERROR,
                    "Cada documento debe incluir un archivo."
            );
        }
    }

    private String resolveDocumentType(CreateRequestDocumentForm document) {
        return StringUtils.hasText(document.getDocumentType())
                ? document.getDocumentType().trim()
                : DEFAULT_DOCUMENT_TYPE;
    }

    private String resolveDocumentName(CreateRequestDocumentForm document, MultipartFile file) {
        if (StringUtils.hasText(document.getName())) {
            return document.getName().trim();
        }

        String originalFilename = file.getOriginalFilename();
        if (!StringUtils.hasText(originalFilename)) {
            return DEFAULT_DOCUMENT_NAME;
        }

        String fileName = StringUtils.getFilename(StringUtils.cleanPath(originalFilename));
        return StringUtils.hasText(fileName) ? fileName : DEFAULT_DOCUMENT_NAME;
    }
}
