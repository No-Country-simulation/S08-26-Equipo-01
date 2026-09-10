package com.nocountry.qualitytrack.requests.controller;

import com.nocountry.qualitytrack.auth.security.CurrentUserId;
import com.nocountry.qualitytrack.requests.documentation.GetJobCaseApiDocs;
import com.nocountry.qualitytrack.requests.documentation.JobCaseApiDocs;
import com.nocountry.qualitytrack.requests.documentation.ListJobCasesApiDocs;
import com.nocountry.qualitytrack.requests.dto.response.JobCaseResponse;
import com.nocountry.qualitytrack.requests.service.JobCaseService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/job-cases")
@RequiredArgsConstructor
@JobCaseApiDocs
public class JobCaseController {

    private final JobCaseService jobCaseService;

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
    public ResponseEntity<ApiResponse<JobCaseResponse>> get(
            @CurrentUserId Long currentUserId,
            @PathVariable Long caseId
    ) {
        JobCaseResponse response = jobCaseService.get(currentUserId, caseId);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.JOB_CASE_RETRIEVED,
                "Expediente consultado correctamente.",
                response
        ));
    }
}
