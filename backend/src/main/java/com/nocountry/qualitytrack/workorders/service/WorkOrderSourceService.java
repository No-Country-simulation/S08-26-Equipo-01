package com.nocountry.qualitytrack.workorders.service;

import com.nocountry.qualitytrack.requests.dto.response.CaseInformationRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.CaseMaterialSpecificationResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.CaseInformationRequestRepository;
import com.nocountry.qualitytrack.requests.repository.CaseMaterialSpecificationRepository;
import com.nocountry.qualitytrack.requests.service.CustomerRequestDocumentService;
import com.nocountry.qualitytrack.workorders.dto.response.WorkOrderSourceResponse;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkOrderSourceService {

    private final CustomerRequestDocumentService customerRequestDocumentService;
    private final CaseInformationRequestRepository informationRequestRepository;
    private final CaseMaterialSpecificationRepository materialSpecificationRepository;

    @Transactional(readOnly = true)
    public WorkOrderSourceResponse get(Long currentUserId, WorkOrder workOrder) {
        JobCase jobCase = workOrder.getJobCase();

        List<RequestDocumentResponse> documents = customerRequestDocumentService
                .listCurrent(currentUserId, jobCase);
        List<CaseInformationRequestResponse> informationRequests = informationRequestRepository
                .findAllByJobCase_IdOrderByRequestedAtAsc(jobCase.getId())
                .stream()
                .map(CaseInformationRequestResponse::from)
                .toList();
        CaseMaterialSpecificationResponse materialSpecification = materialSpecificationRepository
                .findByJobCase_Id(jobCase.getId())
                .map(CaseMaterialSpecificationResponse::from)
                .orElse(null);

        return WorkOrderSourceResponse.from(
                jobCase,
                materialSpecification,
                documents,
                informationRequests
        );
    }
}
