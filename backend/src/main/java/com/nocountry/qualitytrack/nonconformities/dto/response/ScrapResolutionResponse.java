package com.nocountry.qualitytrack.nonconformities.dto.response;

public record ScrapResolutionResponse(
        NonConformityResponse nonConformity,
        Integer acceptedQuantityBeforeScrap,
        Integer affectedQuantity,
        Integer remainingAcceptedQuantity,
        Integer plannedQuantity,
        boolean readyForDelivery
) {
}
