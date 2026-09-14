package com.nocountry.qualitytrack.requests.dto.response;

import com.nocountry.qualitytrack.requests.entity.CaseInformationRequest;

import java.time.Instant;

public record CustomerInformationRequestResponse(
        Long id,
        String question,
        String requestedByName,
        Instant requestedAt,
        String response,
        String respondedByName,
        Instant respondedAt,
        boolean open
) {
    public static CustomerInformationRequestResponse from(CaseInformationRequest request) {
        return new CustomerInformationRequestResponse(
                request.getId(),
                request.getQuestion(),
                fullName(
                        request.getRequestedByUser().getFirstName(),
                        request.getRequestedByUser().getLastName()
                ),
                request.getRequestedAt(),
                request.getResponse(),
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
