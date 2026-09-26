package com.nocountry.qualitytrack.quotations.dto.response;

import com.nocountry.qualitytrack.requests.dto.response.CaseInformationRequestResponse;
import com.nocountry.qualitytrack.requests.dto.response.CaseMaterialSpecificationResponse;
import com.nocountry.qualitytrack.requests.dto.response.RequestDocumentResponse;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;
import com.nocountry.qualitytrack.users.entity.User;

import java.time.LocalDate;
import java.util.List;

public record QuotationSourceResponse(
        Long caseId,
        String caseNumber,
        Long requestId,
        String requestNumber,
        Long customerId,
        String customerName,
        String customerReference,
        String title,
        String description,
        Integer quantity,
        MaterialRequirementType materialRequirementType,
        String materialRequirement,
        LocalDate requestedDeliveryDate,
        Long requestedByUserId,
        String requestedByName,
        CaseMaterialSpecificationResponse materialSpecification,
        List<RequestDocumentResponse> documents,
        List<CaseInformationRequestResponse> informationRequests
) {
    public static QuotationSourceResponse from(
            JobCase jobCase,
            CaseMaterialSpecificationResponse materialSpecification,
            List<RequestDocumentResponse> documents,
            List<CaseInformationRequestResponse> informationRequests
    ) {
        CustomerRequest request = jobCase.getCustomerRequest();

        return new QuotationSourceResponse(
                jobCase.getId(),
                jobCase.getCaseNumber(),
                request.getId(),
                request.getRequestNumber(),
                request.getCustomer().getId(),
                request.getCustomer().getName(),
                request.getCustomerReference(),
                request.getTitle(),
                request.getDescription(),
                request.getQuantity(),
                request.getMaterialRequirementType(),
                request.getMaterialRequirement(),
                request.getRequestedDeliveryDate(),
                request.getRequestedByUser().getId(),
                fullName(request.getRequestedByUser()),
                materialSpecification,
                documents == null ? List.of() : List.copyOf(documents),
                informationRequests == null ? List.of() : List.copyOf(informationRequests)
        );
    }

    private static String fullName(User user) {
        String first = user.getFirstName() == null ? "" : user.getFirstName().trim();
        String last = user.getLastName() == null ? "" : user.getLastName().trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
