package com.nocountry.qualitytrack.requests.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.requests.documentation.CompleteJobCaseReviewApiDocs;
import com.nocountry.qualitytrack.requests.documentation.DefineCaseMaterialSpecificationApiDocs;
import com.nocountry.qualitytrack.requests.documentation.GetJobCaseApiDocs;
import com.nocountry.qualitytrack.requests.documentation.GetJobCaseTimelineApiDocs;
import com.nocountry.qualitytrack.requests.documentation.JobCaseApiDocs;
import com.nocountry.qualitytrack.requests.documentation.ListJobCasesApiDocs;
import com.nocountry.qualitytrack.requests.documentation.RequestJobCaseInformationApiDocs;
import com.nocountry.qualitytrack.requests.documentation.TakeJobCaseApiDocs;
import com.nocountry.qualitytrack.requests.dto.request.CreateCaseInformationRequest;
import com.nocountry.qualitytrack.requests.dto.request.DefineCaseMaterialSpecificationRequest;
import com.nocountry.qualitytrack.requests.dto.response.CaseInformationRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.CaseMaterialSpecificationResponse;
import com.nocountry.qualitytrack.requests.dto.response.JobCaseDetailResponse;
import com.nocountry.qualitytrack.requests.dto.response.JobCaseResponse;
import com.nocountry.qualitytrack.requests.service.JobCaseService;
import com.nocountry.qualitytrack.requests.service.JobCaseWorkflowService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityEventResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/job-cases")
@RequiredArgsConstructor
@JobCaseApiDocs
public class JobCaseController {

    private final JobCaseService jobCaseService;
    private final JobCaseWorkflowService workflowService;

    @ListJobCasesApiDocs
    @GetMapping
    public ResponseEntity<ApiResponse<List<JobCaseResponse>>> list(
            @CurrentUserId Long currentUserId
    ) {
        List<JobCaseResponse> response = jobCaseService.list(currentUserId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.JOB_CASES_RETRIEVED,
                "Expedientes consultados correctamente.",
                response
        ));
    }

    @GetJobCaseApiDocs
    @GetMapping("/{caseId}")
    public ResponseEntity<ApiResponse<JobCaseDetailResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long caseId
    ) {
        JobCaseDetailResponse response = jobCaseService.get(currentUserId, caseId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.JOB_CASE_RETRIEVED,
                "Expediente consultado correctamente.",
                response
        ));
    }

    @TakeJobCaseApiDocs
    @PostMapping("/{caseId}/take")
    public ResponseEntity<ApiResponse<JobCaseResponse>> take(
            @CurrentUserId Long currentUserId,
            @PathVariable Long caseId
    ) {
        JobCaseResponse response = workflowService.take(currentUserId, caseId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.JOB_CASE_REVIEW_STARTED,
                "Expediente tomado. La revisión ha iniciado correctamente.",
                response
        ));
    }

    @RequestJobCaseInformationApiDocs
    @PostMapping("/{caseId}/information-requests")
    public ResponseEntity<ApiResponse<CaseInformationRequestResponse>> requestInformation(
            @CurrentUserId Long currentUserId,
            @PathVariable Long caseId,
            @Valid @RequestBody CreateCaseInformationRequest request
    ) {
        CaseInformationRequestResponse response = workflowService.requestInformation(
                currentUserId,
                caseId,
                request
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.JOB_CASE_INFORMATION_REQUESTED,
                        "Información solicitada al cliente correctamente.",
                        response
                ));
    }

    @DefineCaseMaterialSpecificationApiDocs
    @PutMapping("/{caseId}/material-specification")
    public ResponseEntity<ApiResponse<CaseMaterialSpecificationResponse>> defineMaterialSpecification(
            @CurrentUserId Long currentUserId,
            @PathVariable Long caseId,
            @Valid @RequestBody DefineCaseMaterialSpecificationRequest request
    ) {
        CaseMaterialSpecificationResponse response = workflowService.defineMaterialSpecification(
                currentUserId,
                caseId,
                request
        );

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.JOB_CASE_MATERIAL_SPECIFICATION_SAVED,
                "Especificación técnica guardada correctamente.",
                response
        ));
    }

    @CompleteJobCaseReviewApiDocs
    @PostMapping("/{caseId}/review/complete")
    public ResponseEntity<ApiResponse<JobCaseResponse>> completeReview(
            @CurrentUserId Long currentUserId,
            @PathVariable Long caseId
    ) {
        JobCaseResponse response = workflowService.completeReview(currentUserId, caseId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.JOB_CASE_READY_FOR_QUOTATION,
                "Revisión completada. El expediente está listo para cotización.",
                response
        ));
    }

    @GetJobCaseTimelineApiDocs
    @GetMapping("/{caseId}/timeline")
    public ResponseEntity<ApiResponse<List<TraceabilityEventResponse>>> timeline(
            @CurrentUserId Long currentUserId,
            @PathVariable Long caseId
    ) {
        List<TraceabilityEventResponse> response = jobCaseService.timeline(currentUserId, caseId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.JOB_CASE_TIMELINE_RETRIEVED,
                "Trazabilidad del expediente consultada correctamente.",
                response
        ));
    }
}
