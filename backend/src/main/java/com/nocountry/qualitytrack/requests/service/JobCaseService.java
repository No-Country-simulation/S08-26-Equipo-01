package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.requests.dto.response.JobCaseResponse;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
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

    @Transactional(readOnly = true)
    public List<JobCaseResponse> list(Long currentUserId) {
        requireCanReadJobCases(currentUserId);

        return jobCaseRepository.findAllByOrderByOpenedAtDesc()
                .stream()
                .map(JobCaseResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public JobCaseResponse get(Long currentUserId, Long caseId) {
        requireCanReadJobCases(currentUserId);

        JobCase jobCase = jobCaseRepository.findById(caseId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el expediente."
                ));

        return JobCaseResponse.from(jobCase);
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
                || role == SystemRole.AUDITOR;
    }
}
