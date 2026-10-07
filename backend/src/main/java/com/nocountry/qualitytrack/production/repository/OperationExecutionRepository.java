package com.nocountry.qualitytrack.production.repository;

import com.nocountry.qualitytrack.production.entity.OperationExecution;
import com.nocountry.qualitytrack.production.enums.OperationExecutionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OperationExecutionRepository extends JpaRepository<OperationExecution, Long> {

    boolean existsByRoutingOperation_IdAndStatus(
            Long routingOperationId,
            OperationExecutionStatus status
    );

    long countByRoutingOperation_Id(Long routingOperationId);

    Optional<OperationExecution> findFirstByRoutingOperation_IdAndStatusOrderByAttemptNumberDesc(
            Long routingOperationId,
            OperationExecutionStatus status
    );

    @Query("""
            select execution.routingOperation.routingSheet.workOrder.id
            from OperationExecution execution
            where execution.id = :executionId
            """)
    Optional<Long> findWorkOrderIdById(@Param("executionId") Long executionId);

    @EntityGraph(attributePaths = {
            "routingOperation",
            "routingOperation.routingSheet",
            "routingOperation.routingSheet.workOrder",
            "operator",
            "machine"
    })
    @Query("""
            select execution
            from OperationExecution execution
            where execution.routingOperation.routingSheet.workOrder.id = :workOrderId
            order by execution.routingOperation.routingSheet.revision asc,
                     execution.routingOperation.sequenceNumber asc,
                     execution.attemptNumber asc
            """)
    List<OperationExecution> findAllByWorkOrderIdOrdered(
            @Param("workOrderId") Long workOrderId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select execution
            from OperationExecution execution
            join fetch execution.routingOperation operation
            join fetch operation.routingSheet routingSheet
            where execution.id = :executionId
            """)
    Optional<OperationExecution> findByIdForUpdate(
            @Param("executionId") Long executionId
    );
}
