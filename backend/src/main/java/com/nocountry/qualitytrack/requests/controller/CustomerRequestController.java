package com.nocountry.qualitytrack.requests.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.documents.service.DocumentDownload;
import com.nocountry.qualitytrack.requests.documentation.AddRequestDocumentVersionApiDocs;
import com.nocountry.qualitytrack.requests.documentation.CancelCustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.documentation.CreateRequestDocumentApiDocs;
import com.nocountry.qualitytrack.requests.documentation.CustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.documentation.DeleteRequestDocumentApiDocs;
import com.nocountry.qualitytrack.requests.documentation.DownloadRequestDocumentVersionApiDocs;
import com.nocountry.qualitytrack.requests.documentation.GetCustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.documentation.ListCustomerRequestsApiDocs;
import com.nocountry.qualitytrack.requests.documentation.ListRequestDocumentVersionsApiDocs;
import com.nocountry.qualitytrack.requests.documentation.SubmitCustomerRequestApiDocs;
import com.nocountry.qualitytrack.requests.dto.request.CancelCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.request.CreateRequestDocumentForm;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequestForm;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestDetailResponse;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentVersionResponse;
import com.nocountry.qualitytrack.requests.service.CustomerRequestDocumentService;
import com.nocountry.qualitytrack.requests.service.CustomerRequestService;
import com.nocountry.qualitytrack.requests.service.CustomerRequestSubmissionService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/customers/{customerId}/requests")
@RequiredArgsConstructor
@CustomerRequestApiDocs
public class CustomerRequestController {

    private static final Set<String> INLINE_PREVIEW_TYPES = Set.of(
            MediaType.APPLICATION_PDF_VALUE,
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp",
            MediaType.IMAGE_GIF_VALUE,
            MediaType.TEXT_PLAIN_VALUE
    );

    private final CustomerRequestService customerRequestService;
    private final CustomerRequestSubmissionService customerRequestSubmissionService;
    private final CustomerRequestDocumentService customerRequestDocumentService;

    @SubmitCustomerRequestApiDocs
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CustomerRequestResponse>> submit(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @Valid @ModelAttribute SubmitCustomerRequestForm form
    ) {
        CustomerRequestResponse response = customerRequestSubmissionService.submit(
                currentUserId,
                customerId,
                form.toRequest(),
                form.getDocuments()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.CUSTOMER_REQUEST_SUBMITTED,
                        "Solicitud enviada correctamente.",
                        response
                ));
    }

    @ListCustomerRequestsApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerRequestResponse>>> list(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId
    ) {
        List<CustomerRequestResponse> response = customerRequestService
                .listForCustomer(currentUserId, customerId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_REQUESTS_RETRIEVED,
                "Solicitudes consultadas correctamente.",
                response
        ));
    }

    @GetCustomerRequestApiDocs
    @GetMapping("/{requestId}")
    public ResponseEntity<ApiResponse<CustomerRequestDetailResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId
    ) {
        CustomerRequestDetailResponse response = customerRequestService
                .getForCustomer(currentUserId, customerId, requestId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_REQUEST_RETRIEVED,
                "Solicitud consultada correctamente.",
                response
        ));
    }

    @CreateRequestDocumentApiDocs
    @PostMapping(value = "/{requestId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RequestDocumentResponse>> createDocument(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @Valid @ModelAttribute CreateRequestDocumentForm form
    ) {
        RequestDocumentResponse response = customerRequestDocumentService.create(
                currentUserId,
                customerId,
                requestId,
                form.toMetadata(),
                form.getFile()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.DOCUMENT_CREATED,
                        "Documento agregado a la solicitud correctamente.",
                        response
                ));
    }

    @DeleteRequestDocumentApiDocs
    @DeleteMapping("/{requestId}/documents/{documentId}")
    public ResponseEntity<Void> removeDocument(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @PathVariable Long documentId
    ) {
        customerRequestDocumentService.remove(
                currentUserId,
                customerId,
                requestId,
                documentId
        );

        return ResponseEntity.noContent().build();
    }

    @AddRequestDocumentVersionApiDocs
    @PostMapping(
            value = "/{requestId}/documents/{documentId}/versions",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<RequestDocumentVersionResponse>> addDocumentVersion(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @PathVariable Long documentId,
            @RequestPart("file") MultipartFile file
    ) {
        RequestDocumentVersionResponse response = customerRequestDocumentService.addVersion(
                currentUserId,
                customerId,
                requestId,
                documentId,
                file
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.DOCUMENT_VERSION_CREATED,
                        "Nueva versión del documento creada correctamente.",
                        response
                ));
    }

    @ListRequestDocumentVersionsApiDocs
    @GetMapping("/{requestId}/documents/{documentId}/versions")
    public ResponseEntity<ApiResponse<List<RequestDocumentVersionResponse>>> listDocumentVersions(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @PathVariable Long documentId
    ) {
        List<RequestDocumentVersionResponse> response = customerRequestDocumentService.listVersions(
                currentUserId,
                customerId,
                requestId,
                documentId
        );

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DOCUMENT_VERSIONS_RETRIEVED,
                "Versiones del documento consultadas correctamente.",
                response
        ));
    }

    @DownloadRequestDocumentVersionApiDocs
    @GetMapping("/{requestId}/documents/{documentId}/versions/{versionId}/content")
    public ResponseEntity<Resource> downloadDocumentVersion(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @PathVariable Long documentId,
            @PathVariable Long versionId,
            @RequestParam(defaultValue = "false") boolean download
    ) {
        DocumentDownload document = customerRequestDocumentService.download(
                currentUserId,
                customerId,
                requestId,
                documentId,
                versionId
        );

        MediaType mediaType = safeMediaType(document.mimeType());
        boolean forceDownload = download || !supportsInlinePreview(mediaType);

        ContentDisposition contentDisposition = forceDownload
                ? ContentDisposition.attachment()
                    .filename(document.fileName(), StandardCharsets.UTF_8)
                    .build()
                : ContentDisposition.inline()
                    .filename(document.fileName(), StandardCharsets.UTF_8)
                    .build();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(document.fileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition.toString())
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
                .header("X-Content-Type-Options", "nosniff")
                .body(document.resource());
    }

    @CancelCustomerRequestApiDocs
    @PostMapping("/{requestId}/cancel")
    public ResponseEntity<ApiResponse<CustomerRequestResponse>> cancel(
            @CurrentUserId Long currentUserId,
            @PathVariable Long customerId,
            @PathVariable Long requestId,
            @Valid @RequestBody(required = false) CancelCustomerRequest request
    ) {
        CustomerRequestResponse response = customerRequestService.cancel(
                currentUserId,
                customerId,
                requestId,
                request
        );

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.CUSTOMER_REQUEST_CANCELLED,
                "Solicitud cancelada correctamente.",
                response
        ));
    }

    private MediaType safeMediaType(String mimeType) {
        try {
            return MediaType.parseMediaType(mimeType);
        } catch (IllegalArgumentException exception) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private boolean supportsInlinePreview(MediaType mediaType) {
        return INLINE_PREVIEW_TYPES.contains(mediaType.toString().toLowerCase());
    }
}
