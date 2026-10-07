package com.nocountry.qualitytrack.quality.repository;

import com.nocountry.qualitytrack.quality.entity.QualityCheck;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QualityCheckRepository extends JpaRepository<QualityCheck, Long> {

    List<QualityCheck> findAllByQualityInspection_IdOrderByIdAsc(Long inspectionId);

    @Query("""
            select qualityCheck.qualityInspection.id
            from QualityCheck qualityCheck
            where qualityCheck.id = :checkId
            """)
    Optional<Long> findInspectionIdById(@Param("checkId") Long checkId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select qualityCheck
            from QualityCheck qualityCheck
            join fetch qualityCheck.qualityInspection
            where qualityCheck.id = :checkId
            """)
    Optional<QualityCheck> findByIdForUpdate(@Param("checkId") Long checkId);
}
