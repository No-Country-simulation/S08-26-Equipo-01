package com.nocountry.qualitytrack.workorders.repository;

import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

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
