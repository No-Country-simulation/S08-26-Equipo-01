package com.nocountry.qualitytrack.quotations.dto.response;

import com.nocountry.qualitytrack.quotations.entity.QuotationItem;

import java.math.BigDecimal;

public record QuotationItemResponse(
        Long id,
        Integer lineNumber,
        String description,
        BigDecimal quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {
    public static QuotationItemResponse from(QuotationItem item) {
        return new QuotationItemResponse(
                item.getId(),
                item.getLineNumber(),
                item.getDescription(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getSubtotal()
        );
    }
}
