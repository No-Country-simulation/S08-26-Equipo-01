package com.nocountry.qualitytrack.devseed;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.users.entity.User;

record DemoInternalActors(
        User commercial,
        User engineering,
        User production,
        User quality,
        User logistics,
        User admin
) {
}

record DemoCustomer(
        User owner,
        Customer customer
) {
}

record DemoRequest(
        DemoCustomer customer,
        Long requestId,
        Long caseId,
        String title,
        int quantity
) {
}

record DemoWorkOrder(
        DemoRequest request,
        Long workOrderId,
        int quantity
) {
}
