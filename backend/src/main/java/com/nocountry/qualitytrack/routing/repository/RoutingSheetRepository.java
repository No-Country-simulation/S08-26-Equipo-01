package com.nocountry.qualitytrack.routing.repository;

import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.enums.RoutingSheetStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RoutingSheetRepository extends JpaRepository<RoutingSheet, Long> {

    boolean existsByWorkOrder_IdAndPurpose(
            Long workOrderId,
            RoutingPurpose purpose
    );

    boolean existsByWorkOrder_IdAndStatusIn(
            Long workOrderId,
            Collection<RoutingSheetStatus> statuses
    );

    @EntityGraph(attributePaths = {
            "workOrder",
            "createdByUser",
            "approvedByUser",
            "releasedByUser"
    })
    List<RoutingSheet> findAllByWorkOrder_IdOrderByRevisionAsc(Long workOrderId);

    @Override
    @EntityGraph(attributePaths = {
            "workOrder",
            "createdByUser",
            "approvedByUser",
            "releasedByUser"
    })
    Optional<RoutingSheet> findById(Long id);

    @Query("""
            select routingSheet.workOrder.id
            from RoutingSheet routingSheet
            where routingSheet.id = :routingSheetId
            """)
    Optional<Long> findWorkOrderIdById(
            @Param("routingSheetId") Long routingSheetId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select routingSheet
            from RoutingSheet routingSheet
            join fetch routingSheet.workOrder workOrder
            join fetch routingSheet.createdByUser
            left join fetch routingSheet.approvedByUser
            left join fetch routingSheet.releasedByUser
            where routingSheet.id = :routingSheetId
            """)
    Optional<RoutingSheet> findByIdForUpdate(
            @Param("routingSheetId") Long routingSheetId
    );
}
