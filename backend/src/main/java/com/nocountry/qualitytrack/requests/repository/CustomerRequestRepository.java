package com.nocountry.qualitytrack.requests.repository;

import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRequestRepository extends JpaRepository<CustomerRequest, Long> {
}
