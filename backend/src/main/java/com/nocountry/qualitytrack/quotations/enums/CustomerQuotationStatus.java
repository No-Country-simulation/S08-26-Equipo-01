package com.nocountry.qualitytrack.quotations.enums;

public enum CustomerQuotationStatus {
    SENT,
    ADJUSTMENT_REQUESTED,
    APPROVED,
    REJECTED,
    EXPIRED,
    CANCELLED,
    REPLACED;

    public static CustomerQuotationStatus fromDomain(
            QuotationStatus status,
            boolean adjustmentPending
    ) {
        return switch (status) {
            case SENT -> SENT;
            case APPROVED -> APPROVED;
            case REJECTED -> REJECTED;
            case EXPIRED -> EXPIRED;
            case CANCELLED -> CANCELLED;
            case SUPERSEDED -> adjustmentPending ? ADJUSTMENT_REQUESTED : REPLACED;
            case DRAFT, ADJUSTMENT_REQUESTED -> throw new IllegalArgumentException(
                    "El estado interno de la cotización no es visible para el cliente."
            );
        };
    }
}
