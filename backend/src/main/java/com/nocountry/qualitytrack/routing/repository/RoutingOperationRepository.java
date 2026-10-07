package com.nocountry.qualitytrack.routing.repository;

import com.nocountry.qualitytrack.routing.entity.RoutingOperation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoutingOperationRepository extends JpaRepository<RoutingOperation, Long> {

    @Query("""
            select operation.routingSheet.workOrder.id
            from RoutingOperation operation
            where operation.id = :operationId
            """)
    Optional<Long> findWorkOrderIdById(@Param("operationId") Long operationId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select operation
            from RoutingOperation operation
            join fetch operation.routingSheet routingSheet
            join fetch routingSheet.workOrder
            where operation.id = :operationId
            """)
    Optional<RoutingOperation> findByIdForUpdate(@Param("operationId") Long operationId);

    @EntityGraph(attributePaths = {"routingSheet", "routingSheet.workOrder"})
    List<RoutingOperation> findAllByRoutingSheet_IdOrderBySequenceNumberAsc(Long routingSheetId);
}
