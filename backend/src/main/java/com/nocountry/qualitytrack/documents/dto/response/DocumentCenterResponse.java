package com.nocountry.qualitytrack.documents.dto.response;

import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentContext;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public record DocumentCenterResponse(
        Long id,
        Long caseId,
        Long requestId,
        Long customerId,
        String documentType,
        String name,
        String description,
        Long createdByUserId,
        String createdByName,
        Instant createdAt,
        DocumentVersionResponse currentVersion,
        Set<DocumentContext> contexts,
        List<Long> workOrderIds,
        List<Long> materialLotIds,
        List<Long> deliveryIds,
        List<DocumentReferenceResponse> references
) {

    public static DocumentCenterResponse from(
            Document document,
            DocumentVersion currentVersion,
            Set<DocumentContext> contexts,
            List<Long> workOrderIds,
            List<Long> materialLotIds,
            List<Long> deliveryIds,
            List<DocumentReferenceResponse> references
    ) {
        var jobCase = document.getJobCase();
        var request = jobCase.getCustomerRequest();
        var customer = request.getCustomer();

        return new DocumentCenterResponse(
                document.getId(),
                jobCase.getId(),
                request.getId(),
                customer.getId(),
                document.getDocumentType(),
                document.getName(),
                document.getDescription(),
                document.getCreatedBy().getId(),
                fullName(
                        document.getCreatedBy().getFirstName(),
                        document.getCreatedBy().getLastName()
                ),
                document.getCreatedAt(),
                DocumentVersionResponse.from(currentVersion),
                Set.copyOf(contexts),
                List.copyOf(workOrderIds),
                List.copyOf(materialLotIds),
                List.copyOf(deliveryIds),
                List.copyOf(references)
        );
    }

    private static String fullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        return (first + " " + last).trim();
    }
}
