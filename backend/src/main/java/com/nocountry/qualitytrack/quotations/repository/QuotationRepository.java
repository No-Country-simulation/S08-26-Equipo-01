package com.nocountry.qualitytrack.quotations.repository;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.quotations.enums.QuotationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    @Query("""
            select quotation.status as status,
                   count(quotation) as total
            from Quotation quotation
            group by quotation.status
            """)
    List<StatusCount> countGroupedByStatus();

    interface StatusCount {
        QuotationStatus getStatus();

        long getTotal();
    }

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdByUser",
            "cancelledByUser"
    })
    @Query("""
            select quotation
            from Quotation quotation
            join quotation.jobCase jobCase
            join jobCase.customerRequest request
            join request.customer customer
            where (
                    lower(quotation.quotationNumber) like :pattern
                    or lower(jobCase.caseNumber) like :pattern
                    or lower(request.requestNumber) like :pattern
                    or lower(request.title) like :pattern
                    or lower(customer.name) like :pattern
            )
              and not exists (
                    select newer.id
                    from Quotation newer
                    where newer.quotationNumber = quotation.quotationNumber
                      and newer.revision > quotation.revision
              )
            order by quotation.updatedAt desc, quotation.id desc
            """)
    List<Quotation> searchCurrentInternal(
            @Param("pattern") String pattern,
            Pageable pageable
    );

    boolean existsByJobCase_Id(Long caseId);

    boolean existsByQuotationNumberAndRevisionGreaterThan(
            String quotationNumber,
            Integer revision
    );

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdByUser",
            "cancelledByUser"
    })
    @Query("""
            select quotation
            from Quotation quotation
            where not exists (
                select newer.id
                from Quotation newer
                where newer.quotationNumber = quotation.quotationNumber
                  and newer.revision > quotation.revision
            )
            order by quotation.updatedAt desc
            """)
    List<Quotation> findCurrentRevisions();

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdByUser",
            "cancelledByUser"
    })
    @Query("""
            select quotation
            from Quotation quotation
            where quotation.jobCase.customerRequest.customer.id = :customerId
              and quotation.sentAt is not null
              and not exists (
                  select newer.id
                  from Quotation newer
                  where newer.quotationNumber = quotation.quotationNumber
                    and newer.sentAt is not null
                    and newer.revision > quotation.revision
              )
            order by quotation.createdAt desc
            """)
    List<Quotation> findLatestVisibleRevisionsForCustomer(
            @Param("customerId") Long customerId
    );


    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer"
    })
    @Query("""
            select quotation
            from Quotation quotation
            where quotation.status = com.nocountry.qualitytrack.quotations.enums.QuotationStatus.APPROVED
              and quotation.jobCase.status = com.nocountry.qualitytrack.requests.enums.JobCaseStatus.AWAITING_WORK_ORDER
              and not exists (
                  select workOrder.id
                  from WorkOrder workOrder
                  where workOrder.jobCase = quotation.jobCase
              )
            order by quotation.approvedAt asc, quotation.id asc
            """)
    List<Quotation> findPendingWorkOrderCandidates();

    Optional<Quotation> findByQuotationNumberAndRevision(
            String quotationNumber,
            Integer revision
    );

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdByUser"
    })
    Optional<Quotation> findByJobCase_IdAndStatus(
            Long caseId,
            QuotationStatus status
    );

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdByUser",
            "cancelledByUser"
    })
    List<Quotation> findAllByQuotationNumberOrderByRevisionDesc(String quotationNumber);

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdByUser",
            "cancelledByUser",
            "items"
    })
    @Query("select distinct quotation from Quotation quotation where quotation.id = :quotationId")
    Optional<Quotation> findDetailById(@Param("quotationId") Long quotationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select quotation
            from Quotation quotation
            join fetch quotation.jobCase jobCase
            join fetch jobCase.customerRequest request
            join fetch request.customer customer
            join fetch quotation.createdByUser
            left join fetch quotation.cancelledByUser
            where quotation.id = :quotationId
            """)
    Optional<Quotation> findByIdForUpdate(@Param("quotationId") Long quotationId);

    @Query("""
            select quotation.id
            from Quotation quotation
            where quotation.status = com.nocountry.qualitytrack.quotations.enums.QuotationStatus.SENT
              and quotation.validUntil < :today
            order by quotation.id
            """)
    List<Long> findIdsDueForExpiration(@Param("today") LocalDate today);
}
