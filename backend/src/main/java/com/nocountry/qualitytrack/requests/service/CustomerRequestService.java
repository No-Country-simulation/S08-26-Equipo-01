package com.nocountry.qualitytrack.requests.service;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.enums.CustomerStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.requests.dto.request.CancelCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.request.SubmitCustomerRequest;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestDetailResponse;
import com.nocountry.qualitytrack.requests.dto.response.CustomerRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.repository.CustomerRequestRepository;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerRequestService {

    private final CustomerRequestRepository customerRequestRepository;
    private final JobCaseRepository jobCaseRepository;
    private final CustomerMembershipRepository membershipRepository;
    private final RequestReferenceGenerator referenceGenerator;
    private final CustomerRequestDocumentService customerRequestDocumentService;
    private final TraceabilityService traceabilityService;

    @Transactional
    public CustomerRequestResponse submit(
            Long currentUserId,
            Long customerId,
            SubmitCustomerRequest input
    ) {
        CustomerMembership membership = requireActiveMembership(currentUserId, customerId);
        requireCanSubmit(membership);

        if (membership.getCustomer().getStatus() != CustomerStatus.ACTIVE) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "La empresa no está activa para recibir nuevas solicitudes."
            );
        }

        CustomerRequest request = CustomerRequest.submit(
                membership.getCustomer(),
                referenceGenerator.nextCustomerRequestNumber(),
                normalizeNullable(input.customerReference()),
                input.title().trim(),
                input.description().trim(),
                input.quantity(),
                input.materialRequirementType(),
                input.materialRequirement().trim(),
                input.requestedDeliveryDate(),
                membership.getUser()
        );

        request = customerRequestRepository.saveAndFlush(request);

        JobCase jobCase = JobCase.open(
                request,
                referenceGenerator.nextJobCaseNumber(),
                Instant.now()
        );
        jobCase = jobCaseRepository.saveAndFlush(jobCase);

        traceabilityService.record(
                jobCase,
                TraceabilityAggregateType.CUSTOMER_REQUEST,
                request.getId(),
                TraceabilityEventType.REQUEST_SUBMITTED,
                null,
                null,
                currentUserId,
                metadata(
                        "requestNumber", request.getRequestNumber(),
                        "customerId", customerId,
                        "title", request.getTitle()
                )
        );

        traceabilityService.record(
                jobCase,
                TraceabilityAggregateType.JOB_CASE,
                jobCase.getId(),
                TraceabilityEventType.JOB_CASE_CREATED,
                null,
                jobCase.getStatus().name(),
                currentUserId,
                metadata(
                        "caseNumber", jobCase.getCaseNumber(),
                        "requestId", request.getId(),
                        "requestNumber", request.getRequestNumber()
                )
        );

        return CustomerRequestResponse.from(request, jobCase);
    }

    @Transactional(readOnly = true)
    public List<CustomerRequestResponse> listForCustomer(Long currentUserId, Long customerId) {
        requireActiveMembership(currentUserId, customerId);

        return jobCaseRepository
                .findAllByCustomerRequest_Customer_IdOrderByOpenedAtDesc(customerId)
                .stream()
                .map(jobCase -> CustomerRequestResponse.from(jobCase.getCustomerRequest(), jobCase))
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerRequestDetailResponse getForCustomer(
            Long currentUserId,
            Long customerId,
            Long requestId
    ) {
        requireActiveMembership(currentUserId, customerId);

        JobCase jobCase = jobCaseRepository
                .findByCustomerRequest_IdAndCustomerRequest_Customer_Id(requestId, customerId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la solicitud."
                ));

        CustomerRequestResponse request = CustomerRequestResponse.from(
                jobCase.getCustomerRequest(),
                jobCase
        );
        List<RequestDocumentResponse> documents = customerRequestDocumentService
                .listCurrent(currentUserId, jobCase);

        return CustomerRequestDetailResponse.from(request, documents);
    }

    @Transactional
    public CustomerRequestResponse cancel(
            Long currentUserId,
            Long customerId,
            Long requestId,
            CancelCustomerRequest input
    ) {
        CustomerMembership membership = requireActiveMembership(currentUserId, customerId);
        requireCanCancel(membership);

        JobCase jobCase = jobCaseRepository
                .findByRequestAndCustomerForUpdate(requestId, customerId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la solicitud."
                ));

        if (!jobCase.canBeCancelled()) {
            throw new BusinessException(
                    ApiErrorCode.CUSTOMER_REQUEST_CANNOT_BE_CANCELLED,
                    "La solicitud no puede cancelarse en su estado actual."
            );
        }

        JobCaseStatus previousStatus = jobCase.getStatus();
        String reason = normalizeNullable(input == null ? null : input.reason());

        jobCase.cancel(
                membership.getUser(),
                reason,
                Instant.now()
        );
        jobCase = jobCaseRepository.saveAndFlush(jobCase);

        traceabilityService.record(
                jobCase,
                TraceabilityAggregateType.JOB_CASE,
                jobCase.getId(),
                TraceabilityEventType.CUSTOMER_REQUEST_CANCELLED,
                previousStatus.name(),
                jobCase.getStatus().name(),
                currentUserId,
                metadata(
                        "requestId", requestId,
                        "requestNumber", jobCase.getCustomerRequest().getRequestNumber(),
                        "reason", reason
                )
        );

        return CustomerRequestResponse.from(jobCase.getCustomerRequest(), jobCase);
    }

    private CustomerMembership requireActiveMembership(Long userId, Long customerId) {
        return membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                        customerId,
                        userId,
                        CustomerMembershipStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "No tienes acceso a esta empresa."
                ));
    }

    private void requireCanSubmit(CustomerMembership membership) {
        if (membership.getRole() != CustomerMembershipRole.ADMIN
                && membership.getRole() != CustomerMembershipRole.REQUESTER) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Tu rol dentro de la empresa no permite crear solicitudes."
            );
        }
    }

    private void requireCanCancel(CustomerMembership membership) {
        if (membership.getRole() != CustomerMembershipRole.ADMIN
                && membership.getRole() != CustomerMembershipRole.REQUESTER) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Tu rol dentro de la empresa no permite cancelar solicitudes."
            );
        }
    }

    private Map<String, Object> metadata(Object... entries) {
        Map<String, Object> metadata = new LinkedHashMap<>();
        for (int index = 0; index < entries.length; index += 2) {
            String key = (String) entries[index];
            Object value = entries[index + 1];
            if (value != null) {
                metadata.put(key, value);
            }
        }
        return metadata;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
