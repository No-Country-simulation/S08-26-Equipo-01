package com.nocountry.qualitytrack.materials.repository;

import com.nocountry.qualitytrack.materials.entity.WorkOrderMaterialPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkOrderMaterialPlanRepository
        extends JpaRepository<WorkOrderMaterialPlan, Long> {

    List<WorkOrderMaterialPlan> findAllByWorkOrder_IdOrderByIdAsc(Long workOrderId);

    Optional<WorkOrderMaterialPlan> findByWorkOrder_IdAndMaterial_Id(
            Long workOrderId,
            Long materialId
    );

    Optional<WorkOrderMaterialPlan> findByIdAndWorkOrder_Id(
            Long id,
            Long workOrderId
    );
}
