package com.nocountry.qualitytrack.requests.repository;

import com.nocountry.qualitytrack.requests.entity.RequestDeliveryDestination;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RequestDeliveryDestinationRepository
        extends JpaRepository<RequestDeliveryDestination, Long> {

    Optional<RequestDeliveryDestination> findByCustomerRequest_Id(Long requestId);
}
