package com.nocountry.qualitytrack.quotations.dto.response;

import com.nocountry.qualitytrack.requests.entity.CaseMaterialSpecification;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.MaterialRequirementType;

import java.time.LocalDate;

public record CustomerQuotationSourceResponse(
        String title,
        Integer quantity,
        MaterialRequirementType materialRequirementType,
        String materialRequirement,
        String materialName,
        String standardOrGrade,
        LocalDate requestedDeliveryDate
) {
    public static CustomerQuotationSourceResponse from(
            JobCase jobCase,
            CaseMaterialSpecification materialSpecification
    ) {
        CustomerRequest request = jobCase.getCustomerRequest();

        return new CustomerQuotationSourceResponse(
                request.getTitle(),
                request.getQuantity(),
                request.getMaterialRequirementType(),
                request.getMaterialRequirement(),
                materialSpecification == null ? null : materialSpecification.getMaterialName(),
                materialSpecification == null ? null : materialSpecification.getStandardOrGrade(),
                request.getRequestedDeliveryDate()
        );
    }
}
