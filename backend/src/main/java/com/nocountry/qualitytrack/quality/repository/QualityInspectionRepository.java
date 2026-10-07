package com.nocountry.qualitytrack.quality.repository;

import com.nocountry.qualitytrack.quality.entity.QualityInspection;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QualityInspectionRepository extends JpaRepository<QualityInspection, Long> {

    @EntityGraph(attributePaths = {"workOrder", "inspector", "reworkNonConformity"})
    List<QualityInspection> findAllByWorkOrder_IdOrderByCreatedAtAscIdAsc(Long workOrderId);

    @Override
    @EntityGraph(attributePaths = {"workOrder", "inspector", "reworkNonConformity"})
    Optional<QualityInspection> findById(Long id);

    @Query("""
            select inspection.workOrder.id
            from QualityInspection inspection
            where inspection.id = :inspectionId
            """)
    Optional<Long> findWorkOrderIdById(@Param("inspectionId") Long inspectionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select inspection
            from QualityInspection inspection
            join fetch inspection.workOrder workOrder
            join fetch workOrder.jobCase
            left join fetch inspection.inspector
            left join fetch inspection.reworkNonConformity
            where inspection.id = :inspectionId
            """)
    Optional<QualityInspection> findByIdForUpdate(
            @Param("inspectionId") Long inspectionId
    );
}
