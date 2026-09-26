package com.nocountry.qualitytrack.quotations.dto.response;

public record CustomerQuotationAdjustmentResponse(
        String notes,
        String response
) {
    public static CustomerQuotationAdjustmentResponse of(
            String notes,
            String response
    ) {
        if (notes == null && response == null) {
            return null;
        }
        return new CustomerQuotationAdjustmentResponse(notes, response);
    }
}
