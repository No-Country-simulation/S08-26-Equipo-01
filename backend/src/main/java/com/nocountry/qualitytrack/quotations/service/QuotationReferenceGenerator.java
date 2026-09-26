package com.nocountry.qualitytrack.quotations.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class QuotationReferenceGenerator {

    private final EntityManager entityManager;

    public String nextQuotationNumber() {
        Number value = (Number) entityManager
                .createNativeQuery("SELECT nextval('quotation_number_seq')")
                .getSingleResult();
        return "QT-%08d".formatted(value.longValue());
    }
}
