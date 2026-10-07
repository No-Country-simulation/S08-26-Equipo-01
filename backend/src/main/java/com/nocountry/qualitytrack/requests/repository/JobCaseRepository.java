package com.nocountry.qualitytrack.requests.repository;

import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobCaseRepository extends JpaRepository<JobCase, Long> {

    @Query("""
            select jobCase.status as status,
                   count(jobCase) as total
            from JobCase jobCase
            group by jobCase.status
            """)
    List<StatusCount> countGroupedByStatus();

    interface StatusCount {
        JobCaseStatus getStatus();

        long getTotal();
    }

    @Query("""
            select jobCase.customerRequest.customer.id as customerId,
                   jobCase.status as status,
                   count(jobCase) as total
            from JobCase jobCase
            group by jobCase.customerRequest.customer.id, jobCase.status
            """)
    List<CustomerStatusCount> countByCustomerAndStatus();

    @Query("""
            select jobCase.customerRequest.customer.id as customerId,
                   jobCase.status as status,
                   count(jobCase) as total
            from JobCase jobCase
            where jobCase.customerRequest.customer.id = :customerId
            group by jobCase.customerRequest.customer.id, jobCase.status
            """)
    List<CustomerStatusCount> countByCustomerAndStatus(
            @Param("customerId") Long customerId
    );

    interface CustomerStatusCount {
        Long getCustomerId();

        JobCaseStatus getStatus();

        long getTotal();
    }

    @EntityGraph(attributePaths = {
            "customerRequest",
            "customerRequest.customer",
            "customerRequest.requestedByUser",
            "assignedToUser",
            "cancelledByUser"
    })
    @Query("""
            select jobCase
            from JobCase jobCase
            join jobCase.customerRequest request
            join request.customer customer
            where lower(jobCase.caseNumber) like :pattern
               or lower(request.requestNumber) like :pattern
               or lower(request.title) like :pattern
               or lower(coalesce(request.customerReference, '')) like :pattern
               or lower(customer.name) like :pattern
            order by jobCase.updatedAt desc, jobCase.id desc
            """)
    List<JobCase> searchInternal(
            @Param("pattern") String pattern,
            Pageable pageable
    );

    @EntityGraph(attributePaths = {
            "customerRequest",
            "customerRequest.customer",
            "customerRequest.requestedByUser",
            "assignedToUser",
            "cancelledByUser"
    })
    @Query(
            value = """
                    select jobCase
                    from JobCase jobCase
                    join jobCase.customerRequest request
                    join request.customer customer
                    join request.requestedByUser requestedBy
                    left join jobCase.assignedToUser assigned
                    where customer.id = :customerId
                      and (:status is null or jobCase.status = :status)
                      and (
                          :assigned is null
                          or (:assigned = true and assigned is not null)
                          or (:assigned = false and assigned is null)
                      )
                      and (
                          :pattern is null
                          or lower(jobCase.caseNumber) like :pattern
                          or lower(request.requestNumber) like :pattern
                          or lower(request.title) like :pattern
                          or lower(request.description) like :pattern
                          or lower(coalesce(request.customerReference, '')) like :pattern
                          or lower(concat(requestedBy.firstName, ' ', requestedBy.lastName)) like :pattern
                          or lower(concat(coalesce(assigned.firstName, ''), ' ', coalesce(assigned.lastName, ''))) like :pattern
                      )
                    order by jobCase.openedAt desc, jobCase.id desc
                    """,
            countQuery = """
                    select count(jobCase)
                    from JobCase jobCase
                    join jobCase.customerRequest request
                    join request.customer customer
                    join request.requestedByUser requestedBy
                    left join jobCase.assignedToUser assigned
                    where customer.id = :customerId
                      and (:status is null or jobCase.status = :status)
                      and (
                          :assigned is null
                          or (:assigned = true and assigned is not null)
                          or (:assigned = false and assigned is null)
                      )
                      and (
                          :pattern is null
                          or lower(jobCase.caseNumber) like :pattern
                          or lower(request.requestNumber) like :pattern
                          or lower(request.title) like :pattern
                          or lower(request.description) like :pattern
                          or lower(coalesce(request.customerReference, '')) like :pattern
                          or lower(concat(requestedBy.firstName, ' ', requestedBy.lastName)) like :pattern
                          or lower(concat(coalesce(assigned.firstName, ''), ' ', coalesce(assigned.lastName, ''))) like :pattern
                      )
                    """
    )
    Page<JobCase> searchByCustomer(
            @Param("customerId") Long customerId,
            @Param("pattern") String pattern,
            @Param("status") JobCaseStatus status,
            @Param("assigned") Boolean assigned,
            Pageable pageable
    );

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
            join fetch jobCase.customerRequest request
            join fetch request.customer customer
            left join fetch jobCase.assignedToUser
            where jobCase.id = :caseId
            """)
    Optional<JobCase> findByIdForUpdate(@Param("caseId") Long caseId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select jobCase
            from JobCase jobCase
            join fetch jobCase.customerRequest request
            join fetch request.customer customer
            left join fetch jobCase.assignedToUser
            where request.id = :requestId
              and customer.id = :customerId
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
