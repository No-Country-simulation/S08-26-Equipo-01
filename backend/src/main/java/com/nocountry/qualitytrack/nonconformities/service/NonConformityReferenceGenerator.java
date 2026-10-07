package com.nocountry.qualitytrack.nonconformities.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NonConformityReferenceGenerator {

    private final EntityManager entityManager;

    public String nextNumber() {
        Number value = (Number) entityManager
                .createNativeQuery("SELECT nextval('non_conformity_number_seq')")
                .getSingleResult();
        return "NC-%04d".formatted(value.longValue());
    }
}
