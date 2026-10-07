package com.nocountry.qualitytrack.documents.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.documents.documentation.DocumentCenterApiDocs;
import com.nocountry.qualitytrack.documents.dto.response.DocumentCenterResponse;
import com.nocountry.qualitytrack.documents.dto.response.DocumentVersionResponse;
import com.nocountry.qualitytrack.documents.enums.DocumentContext;
import com.nocountry.qualitytrack.documents.service.DocumentCenterService;
import com.nocountry.qualitytrack.documents.service.DocumentDownload;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
@Validated
@DocumentCenterApiDocs
public class DocumentCenterController {

    private static final Set<String> INLINE_PREVIEW_TYPES = Set.of(
            MediaType.APPLICATION_PDF_VALUE,
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            "image/webp",
            MediaType.IMAGE_GIF_VALUE,
            MediaType.TEXT_PLAIN_VALUE
    );

    private final DocumentCenterService documentCenterService;
    private final DocumentService documentService;

    @Operation(summary = "Consultar el centro documental con filtros operativos")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentCenterResponse>>> search(
            @CurrentUserId Long currentUserId,
            @RequestParam(required = false) @Positive Long customerId,
            @RequestParam(required = false) @Positive Long caseId,
            @RequestParam(required = false) @Positive Long workOrderId,
            @RequestParam(required = false) @Positive Long materialLotId,
            @RequestParam(required = false) @Positive Long deliveryId,
            @RequestParam(required = false) String documentType,
            @RequestParam(required = false) DocumentContext context
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DOCUMENTS_RETRIEVED,
                "Centro documental consultado correctamente.",
                documentCenterService.search(
                        currentUserId,
                        customerId,
                        caseId,
                        workOrderId,
                        materialLotId,
                        deliveryId,
                        documentType,
                        context
                )
        ));
    }

    @Operation(summary = "Listar versiones de un documento desde el centro documental")
    @GetMapping("/{documentId}/versions")
    public ResponseEntity<ApiResponse<List<DocumentVersionResponse>>> listVersions(
            @CurrentUserId Long currentUserId,
            @PathVariable Long documentId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.DOCUMENT_VERSIONS_RETRIEVED,
                "Versiones del documento consultadas correctamente.",
                documentService.listVersionsInternal(currentUserId, documentId)
        ));
    }

    @Operation(summary = "Abrir o descargar una versión desde el centro documental")
    @GetMapping("/{documentId}/versions/{versionId}/content")
    public ResponseEntity<Resource> content(
            @CurrentUserId Long currentUserId,
            @PathVariable Long documentId,
            @PathVariable Long versionId,
            @RequestParam(defaultValue = "false") boolean download
    ) {
        DocumentDownload document = documentService.downloadInternal(
                currentUserId,
                documentId,
                versionId
        );

        MediaType mediaType = safeMediaType(document.mimeType());
        boolean forceDownload = download || !supportsInlinePreview(mediaType);
        ContentDisposition disposition = forceDownload
                ? ContentDisposition.attachment()
                    .filename(document.fileName(), StandardCharsets.UTF_8)
                    .build()
                : ContentDisposition.inline()
                    .filename(document.fileName(), StandardCharsets.UTF_8)
                    .build();

        return ResponseEntity.ok()
                .contentType(mediaType)
                .contentLength(document.fileSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
                .header("X-Content-Type-Options", "nosniff")
                .body(document.resource());
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
