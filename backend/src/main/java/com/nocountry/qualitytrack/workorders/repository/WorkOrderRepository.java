package com.nocountry.qualitytrack.workorders.repository;

import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    @Query("""
            select workOrder.status as status,
                   count(workOrder) as total
            from WorkOrder workOrder
            group by workOrder.status
            """)
    List<StatusCount> countGroupedByStatus();

    interface StatusCount {
        WorkOrderStatus getStatus();

        long getTotal();
    }

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "approvedQuotation",
            "createdByUser",
            "cancelledByUser"
    })
    @Query("""
            select workOrder
            from WorkOrder workOrder
            join workOrder.jobCase jobCase
            join jobCase.customerRequest request
            join request.customer customer
            where lower(workOrder.workOrderNumber) like :pattern
               or lower(jobCase.caseNumber) like :pattern
               or lower(request.requestNumber) like :pattern
               or lower(request.title) like :pattern
               or lower(customer.name) like :pattern
            order by workOrder.updatedAt desc, workOrder.id desc
            """)
    List<WorkOrder> searchInternal(
            @Param("pattern") String pattern,
            Pageable pageable
    );

    boolean existsByJobCase_Id(Long caseId);

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "jobCase.customerRequest.requestedByUser",
            "approvedQuotation",
            "createdByUser",
            "cancelledByUser"
    })
    List<WorkOrder> findAllByOrderByCreatedAtDesc();

    @Override
    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "jobCase.customerRequest.requestedByUser",
            "approvedQuotation",
            "createdByUser",
            "cancelledByUser"
    })
    Optional<WorkOrder> findById(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select workOrder
            from WorkOrder workOrder
            join fetch workOrder.jobCase jobCase
            join fetch jobCase.customerRequest request
            join fetch request.customer
            join fetch request.requestedByUser
            join fetch workOrder.approvedQuotation
            join fetch workOrder.createdByUser
            left join fetch workOrder.cancelledByUser
            where workOrder.id = :workOrderId
            """)
    Optional<WorkOrder> findByIdForUpdate(@Param("workOrderId") Long workOrderId);
}
