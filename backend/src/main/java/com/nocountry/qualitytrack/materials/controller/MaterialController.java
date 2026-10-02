package com.nocountry.qualitytrack.materials.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.materials.documentation.CreateMaterialApiDocs;
import com.nocountry.qualitytrack.materials.documentation.CreateMaterialLotApiDocs;
import com.nocountry.qualitytrack.materials.documentation.ListMaterialLotsApiDocs;
import com.nocountry.qualitytrack.materials.documentation.ListMaterialsApiDocs;
import com.nocountry.qualitytrack.materials.documentation.MaterialApiDocs;
import com.nocountry.qualitytrack.materials.dto.request.CreateMaterialLotRequest;
import com.nocountry.qualitytrack.materials.dto.request.CreateMaterialRequest;
import com.nocountry.qualitytrack.materials.dto.response.MaterialLotResponse;
import com.nocountry.qualitytrack.materials.dto.response.MaterialResponse;
import com.nocountry.qualitytrack.materials.service.MaterialService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/materials")
@RequiredArgsConstructor
@MaterialApiDocs
public class MaterialController {

    private final MaterialService materialService;

    @CreateMaterialApiDocs
    @PostMapping
    public ResponseEntity<ApiResponse<MaterialResponse>> createMaterial(
            @CurrentUserId Long currentUserId,
            @Valid @RequestBody CreateMaterialRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.MATERIAL_CREATED,
                        "Material creado correctamente.",
                        materialService.createMaterial(currentUserId, request)
                ));
    }

    @ListMaterialsApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> listMaterials(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.MATERIALS_RETRIEVED,
                "Materiales consultados correctamente.",
                materialService.listMaterials(currentUserId)
        ));
    }

    @CreateMaterialLotApiDocs
    @PostMapping("/{materialId}/lots")
    public ResponseEntity<ApiResponse<MaterialLotResponse>> createLot(
            @CurrentUserId Long currentUserId,
            @PathVariable Long materialId,
            @Valid @RequestBody CreateMaterialLotRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.MATERIAL_LOT_CREATED,
                        "Lote de material creado correctamente.",
                        materialService.createLot(currentUserId, materialId, request)
                ));
    }

    @Operation(summary = "Subir o actualizar el certificado de un lote")
    @PostMapping(
            value = "/{materialId}/lots/{lotId}/certificate",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<MaterialLotResponse>> attachCertificate(
            @CurrentUserId Long currentUserId,
            @PathVariable Long materialId,
            @PathVariable Long lotId,
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.MATERIAL_LOT_CERTIFICATE_ATTACHED,
                "Certificado del lote guardado correctamente.",
                materialService.attachCertificate(
                        currentUserId,
                        materialId,
                        lotId,
                        file
                )
        ));
    }

    @ListMaterialLotsApiDocs
    @GetMapping("/{materialId}/lots")
    public ResponseEntity<ApiResponse<List<MaterialLotResponse>>> listLots(
            @CurrentUserId Long currentUserId,
            @PathVariable Long materialId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.MATERIAL_LOTS_RETRIEVED,
                "Lotes de material consultados correctamente.",
                materialService.listLots(currentUserId, materialId)
        ));
    }
}
