package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.quotations.dto.response.CustomerQuotationSourceResponse;
import com.nocountry.qualitytrack.quotations.dto.response.QuotationSourceResponse;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.dto.response.CaseInformationRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.CaseMaterialSpecificationResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.entity.CaseMaterialSpecification;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.repository.CaseInformationRequestRepository;
import com.nocountry.qualitytrack.requests.repository.CaseMaterialSpecificationRepository;
import com.nocountry.qualitytrack.requests.service.CustomerRequestDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuotationSourceService {

    private final CustomerRequestDocumentService customerRequestDocumentService;
    private final CaseInformationRequestRepository informationRequestRepository;
    private final CaseMaterialSpecificationRepository materialSpecificationRepository;

    @Transactional(readOnly = true)
    public CustomerQuotationSourceResponse getForCustomer(Quotation quotation) {
        JobCase jobCase = quotation.getJobCase();
        CaseMaterialSpecification materialSpecification = materialSpecificationRepository
                .findByJobCase_Id(jobCase.getId())
                .orElse(null);

        return CustomerQuotationSourceResponse.from(jobCase, materialSpecification);
    }

    @Transactional(readOnly = true)
    public QuotationSourceResponse get(
            Long currentUserId,
            Quotation quotation
    ) {
        JobCase jobCase = quotation.getJobCase();

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

        return QuotationSourceResponse.from(
                jobCase,
                materialSpecification,
                documents,
                informationRequests
        );
    }
}
