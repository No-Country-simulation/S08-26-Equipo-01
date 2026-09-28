package com.nocountry.qualitytrack.materials.repository;

import com.nocountry.qualitytrack.materials.entity.WorkOrderMaterial;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface WorkOrderMaterialRepository extends JpaRepository<WorkOrderMaterial, Long> {

    @EntityGraph(attributePaths = {
            "workOrder",
            "materialLot",
            "materialLot.material",
            "materialLot.certificateDocumentVersion",
            "recordedByUser"
    })
    List<WorkOrderMaterial> findAllByWorkOrder_IdOrderByRecordedAtAsc(Long workOrderId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select consumption
            from WorkOrderMaterial consumption
            join fetch consumption.workOrder
            join fetch consumption.materialLot lot
            join fetch lot.material
            where consumption.workOrder.id = :workOrderId
              and consumption.materialLot.id = :materialLotId
            """)
    Optional<WorkOrderMaterial> findByWorkOrderAndLotForUpdate(
            @Param("workOrderId") Long workOrderId,
            @Param("materialLotId") Long materialLotId
    );

    @Query("""
            select coalesce(sum(consumption.quantityUsed), 0)
            from WorkOrderMaterial consumption
            where consumption.materialLot.id = :materialLotId
            """)
    BigDecimal sumQuantityUsedByMaterialLotId(@Param("materialLotId") Long materialLotId);
}
