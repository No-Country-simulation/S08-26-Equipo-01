package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.requests.entity.CaseInformationRequest;

import java.time.Instant;

public record CaseInformationRequestResponse(
        Long id,
        String question,
        Long requestedByUserId,
        String requestedByName,
        Instant requestedAt,
        String response,
        Long respondedByUserId,
        String respondedByName,
        Instant respondedAt,
        boolean open
) {
    public static CaseInformationRequestResponse from(CaseInformationRequest request) {
        return new CaseInformationRequestResponse(
                request.getId(),
                request.getQuestion(),
                request.getRequestedByUser().getId(),
                fullName(
                        request.getRequestedByUser().getFirstName(),
                        request.getRequestedByUser().getLastName()
                ),
                request.getRequestedAt(),
                request.getResponse(),
                request.getRespondedByUser() == null ? null : request.getRespondedByUser().getId(),
                request.getRespondedByUser() == null
                        ? null
                        : fullName(
                                request.getRespondedByUser().getFirstName(),
                                request.getRespondedByUser().getLastName()
                        ),
                request.getRespondedAt(),
                request.isOpen()
        );
    }

    private static String fullName(String firstName, String lastName) {
        String first = firstName == null ? "" : firstName.trim();
        String last = lastName == null ? "" : lastName.trim();
        String name = (first + " " + last).trim();
        return name.isBlank() ? null : name;
    }
}
