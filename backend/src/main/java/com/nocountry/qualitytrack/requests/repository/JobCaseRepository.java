package com.nocountry.qualitytrack.requests.repository;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobCaseRepository extends JpaRepository<JobCase, Long> {

    @EntityGraph(attributePaths = {
            "customerRequest",
            "customerRequest.customer",
            "customerRequest.requestedByUser",
            "assignedToUser",
            "cancelledByUser"
    })
    List<JobCase> findAllByCustomerRequest_Customer_IdOrderByOpenedAtDesc(Long customerId);

    @EntityGraph(attributePaths = {
            "customerRequest",
            "customerRequest.customer",
            "customerRequest.requestedByUser",
            "assignedToUser",
            "cancelledByUser"
    })
    Optional<JobCase> findByCustomerRequest_IdAndCustomerRequest_Customer_Id(
            Long requestId,
            Long customerId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select jobCase
            from JobCase jobCase
            where jobCase.customerRequest.id = :requestId
              and jobCase.customerRequest.customer.id = :customerId
            """)
    Optional<JobCase> findByRequestAndCustomerForUpdate(
            @Param("requestId") Long requestId,
            @Param("customerId") Long customerId
    );

    @EntityGraph(attributePaths = {
            "customerRequest",
            "customerRequest.customer",
            "customerRequest.requestedByUser",
            "assignedToUser",
            "cancelledByUser"
    })
    List<JobCase> findAllByOrderByOpenedAtDesc();

    @Override
    @EntityGraph(attributePaths = {
            "customerRequest",
            "customerRequest.customer",
            "customerRequest.requestedByUser",
            "assignedToUser",
            "cancelledByUser"
    })
    Optional<JobCase> findById(Long id);
}
