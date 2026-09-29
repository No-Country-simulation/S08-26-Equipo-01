package com.nocountry.qualitytrack.deliveries.repository;

import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    @Override
    @EntityGraph(attributePaths = {
            "workOrder", "workOrder.jobCase", "workOrder.jobCase.customerRequest",
            "workOrder.jobCase.customerRequest.customer", "createdByUser",
            "dispatchedByUser", "deliveredByUser", "cancelledByUser", "evidenceDocumentVersion"
    })
    Optional<Delivery> findById(Long id);

    @EntityGraph(attributePaths = {
            "workOrder", "createdByUser", "dispatchedByUser",
            "deliveredByUser", "cancelledByUser", "evidenceDocumentVersion"
    })
    List<Delivery> findAllByWorkOrder_IdOrderByCreatedAtAscIdAsc(Long workOrderId);

    @EntityGraph(attributePaths = {
            "workOrder", "createdByUser", "dispatchedByUser",
            "deliveredByUser", "cancelledByUser", "evidenceDocumentVersion"
    })
    List<Delivery> findAllByWorkOrder_JobCase_CustomerRequest_IdAndWorkOrder_JobCase_CustomerRequest_Customer_IdOrderByCreatedAtAscIdAsc(
            Long requestId,
            Long customerId
    );

    @Query("select d.workOrder.id from Delivery d where d.id = :deliveryId")
    Optional<Long> findWorkOrderIdById(@Param("deliveryId") Long deliveryId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select d
            from Delivery d
            join fetch d.workOrder workOrder
            join fetch workOrder.jobCase jobCase
            join fetch jobCase.customerRequest request
            join fetch request.customer
            join fetch d.createdByUser
            left join fetch d.dispatchedByUser
            left join fetch d.deliveredByUser
            left join fetch d.cancelledByUser
            left join fetch d.evidenceDocumentVersion
            where d.id = :deliveryId
            """)
    Optional<Delivery> findByIdForUpdate(@Param("deliveryId") Long deliveryId);

    @Query("""
            select coalesce(sum(d.quantity), 0)
            from Delivery d
            where d.workOrder.id = :workOrderId
              and d.status <> :cancelledStatus
            """)
    long sumReservedQuantityByWorkOrderId(
            @Param("workOrderId") Long workOrderId,
            @Param("cancelledStatus") DeliveryStatus cancelledStatus
    );

    @Query("""
            select coalesce(sum(d.quantity), 0)
            from Delivery d
            where d.workOrder.id = :workOrderId
              and d.status = :deliveredStatus
            """)
    long sumDeliveredQuantityByWorkOrderId(
            @Param("workOrderId") Long workOrderId,
            @Param("deliveredStatus") DeliveryStatus deliveredStatus
    );

    boolean existsByEvidenceDocumentVersion_Document_Id(Long documentId);

    @EntityGraph(attributePaths = {
            "workOrder",
            "workOrder.jobCase",
            "workOrder.jobCase.customerRequest",
            "workOrder.jobCase.customerRequest.customer",
            "evidenceDocumentVersion"
    })
    List<Delivery> findAllByEvidenceDocumentVersion_IdAndWorkOrder_JobCase_CustomerRequest_Customer_Id(
            Long documentVersionId,
            Long customerId
    );
}
