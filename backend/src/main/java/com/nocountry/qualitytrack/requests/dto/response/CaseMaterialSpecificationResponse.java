package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.requests.entity.CaseMaterialSpecification;

import java.time.Instant;

public record CaseMaterialSpecificationResponse(
        Long id,
        String materialName,
        String standardOrGrade,
        String technicalNotes,
        Long definedByUserId,
        String definedByName,
        Instant definedAt
) {
    public static CaseMaterialSpecificationResponse from(CaseMaterialSpecification specification) {
        return new CaseMaterialSpecificationResponse(
                specification.getId(),
                specification.getMaterialName(),
                specification.getStandardOrGrade(),
                specification.getTechnicalNotes(),
                specification.getDefinedByUser().getId(),
                fullName(
                        specification.getDefinedByUser().getFirstName(),
                        specification.getDefinedByUser().getLastName()
                ),
                specification.getDefinedAt()
        );
    }

    private static String fullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
