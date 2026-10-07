package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.requests.dto.response.CaseInformationRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.CaseMaterialSpecificationResponse;
import com.nocountry.qualitytrack.requests.dto.response.JobCaseDetailResponse;
import com.nocountry.qualitytrack.requests.dto.response.JobCaseResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.CaseInformationRequestRepository;
import com.nocountry.qualitytrack.requests.repository.CaseMaterialSpecificationRepository;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityTimelinePageResponse;
import com.nocountry.qualitytrack.traceability.dto.response.TraceabilityEventResponse;
import com.nocountry.qualitytrack.traceability.service.TraceabilityActionResolver;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobCaseService {

    private final JobCaseRepository jobCaseRepository;
    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;
    private final CustomerRequestDocumentService customerRequestDocumentService;
    private final CaseInformationRequestRepository informationRequestRepository;
    private final CaseMaterialSpecificationRepository materialSpecificationRepository;
    private final TraceabilityService traceabilityService;
    private final TraceabilityActionResolver traceabilityActionResolver;

    @Transactional(readOnly = true)
    public List<JobCaseResponse> list(Long currentUserId) {
        requireCanReadJobCases(currentUserId);

        return jobCaseRepository.findAllByOrderByOpenedAtDesc()
                .stream()
                .map(JobCaseResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobCaseDetailResponse get(Long currentUserId, Long caseId) {
        requireCanReadJobCases(currentUserId);

        JobCase jobCase = jobCaseRepository.findById(caseId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el expediente."
                ));

        List<RequestDocumentResponse> documents = customerRequestDocumentService
                .listCurrent(currentUserId, jobCase);
        List<CaseInformationRequestResponse> informationRequests = informationRequestRepository
                .findAllByJobCase_IdOrderByRequestedAtAsc(caseId)
                .stream()
                .map(CaseInformationRequestResponse::from)
                .toList();
        CaseMaterialSpecificationResponse materialSpecification = materialSpecificationRepository
                .findByJobCase_Id(caseId)
                .map(CaseMaterialSpecificationResponse::from)
                .orElse(null);

        return JobCaseDetailResponse.from(
                JobCaseResponse.from(jobCase),
                documents,
                informationRequests,
                materialSpecification
        );
    }

    @Transactional(readOnly = true)
    public TraceabilityTimelinePageResponse timeline(
            Long currentUserId,
            Long caseId,
            int limit,
            String cursor
    ) {
        requireCanReadJobCases(currentUserId);

        if (!jobCaseRepository.existsById(caseId)) {
            throw new BusinessException(
                    ApiErrorCode.RESOURCE_NOT_FOUND,
                    "No se encontró el expediente."
            );
        }

        TraceabilityTimelinePageResponse page =
                traceabilityService.timeline(caseId, limit, cursor);

        List<TraceabilityEventResponse> navigableItems = page.items()
                .stream()
                .map(event -> event.withActions(
                        traceabilityActionResolver.resolve(event)
                ))
                .toList();

        return new TraceabilityTimelinePageResponse(
                navigableItems,
                page.nextCursor(),
                page.hasMore()
        );
    }

    private void requireCanReadJobCases(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el usuario autenticado."
                ));

        if (user.getAccountType() != AccountType.INTERNAL) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Esta operación está disponible únicamente para usuarios internos autorizados."
            );
        }

        boolean allowed = userSystemRoleRepository.findAllByIdUserId(userId)
                .stream()
                .map(UserSystemRole::getRole)
                .anyMatch(this::canReadJobCases);

        if (!allowed) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Tu rol interno no permite consultar expedientes."
            );
        }
    }

    private boolean canReadJobCases(SystemRole role) {
        return role == SystemRole.ADMIN
                || role == SystemRole.COMMERCIAL
                || role == SystemRole.ENGINEERING
                || role == SystemRole.PRODUCTION
                || role == SystemRole.QUALITY
                || role == SystemRole.LOGISTICS
                || role == SystemRole.AUDITOR;
    }
}
