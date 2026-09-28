package com.nocountry.qualitytrack.machines.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.machines.documentation.CreateMachineApiDocs;
import com.nocountry.qualitytrack.machines.documentation.ListMachinesApiDocs;
import com.nocountry.qualitytrack.machines.documentation.MachineApiDocs;
import com.nocountry.qualitytrack.machines.dto.request.CreateMachineRequest;
import com.nocountry.qualitytrack.machines.dto.response.MachineResponse;
import com.nocountry.qualitytrack.machines.service.MachineService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/machines")
@RequiredArgsConstructor
@MachineApiDocs
public class MachineController {

    private final MachineService machineService;

    @CreateMachineApiDocs
    @PostMapping
    public ResponseEntity<ApiResponse<MachineResponse>> create(
            @CurrentUserId Long currentUserId,
            @Valid @RequestBody CreateMachineRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.MACHINE_CREATED,
                        "Máquina creada correctamente.",
                        machineService.create(currentUserId, request)
                ));
    }

    @ListMachinesApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<MachineResponse>>> list(
            @CurrentUserId Long currentUserId
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.MACHINES_RETRIEVED,
                "Máquinas consultadas correctamente.",
                machineService.list(currentUserId)
        ));
    }
}
