package com.nocountry.qualitytrack.workorders.service;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WorkOrderReferenceGenerator {

    private final EntityManager entityManager;

    public String nextWorkOrderNumber() {
        Number value = (Number) entityManager
                .createNativeQuery("SELECT nextval('work_order_number_seq')")
                .getSingleResult();
        return "OT-%08d".formatted(value.longValue());
    }
}
