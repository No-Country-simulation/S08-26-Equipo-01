package com.nocountry.qualitytrack.nonconformities.repository;

import com.nocountry.qualitytrack.nonconformities.entity.NonConformity;
import com.nocountry.qualitytrack.nonconformities.enums.NonConformityStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NonConformityRepository extends JpaRepository<NonConformity, Long> {

    long countByStatus(NonConformityStatus status);

    @Override
    @EntityGraph(attributePaths = {
            "workOrder",
            "qualityInspection",
            "openedByUser",
            "resolvedByUser"
    })
    Optional<NonConformity> findById(Long id);

    @EntityGraph(attributePaths = {
            "workOrder",
            "qualityInspection",
            "openedByUser",
            "resolvedByUser"
    })
    List<NonConformity> findAllByWorkOrder_IdOrderByOpenedAtAscIdAsc(Long workOrderId);

    Optional<NonConformity> findByQualityInspection_Id(Long qualityInspectionId);

    boolean existsByQualityInspection_Id(Long qualityInspectionId);

    @Query("""
            select nonConformity.workOrder.id
            from NonConformity nonConformity
            where nonConformity.id = :nonConformityId
            """)
    Optional<Long> findWorkOrderIdById(
            @Param("nonConformityId") Long nonConformityId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select nonConformity
            from NonConformity nonConformity
            join fetch nonConformity.workOrder workOrder
            join fetch workOrder.jobCase
            join fetch nonConformity.qualityInspection
            join fetch nonConformity.openedByUser
            left join fetch nonConformity.resolvedByUser
            where nonConformity.id = :nonConformityId
            """)
    Optional<NonConformity> findByIdForUpdate(
            @Param("nonConformityId") Long nonConformityId
    );
}
