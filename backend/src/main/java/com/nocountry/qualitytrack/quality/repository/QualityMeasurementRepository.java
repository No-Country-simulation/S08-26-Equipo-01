package com.nocountry.qualitytrack.quality.repository;

import com.nocountry.qualitytrack.quality.entity.QualityMeasurement;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QualityMeasurementRepository extends JpaRepository<QualityMeasurement, Long> {

    List<QualityMeasurement> findAllByQualityInspection_IdOrderByIdAsc(Long inspectionId);

    @Query("""
            select measurement.qualityInspection.id
            from QualityMeasurement measurement
            where measurement.id = :measurementId
            """)
    Optional<Long> findInspectionIdById(@Param("measurementId") Long measurementId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select measurement
            from QualityMeasurement measurement
            join fetch measurement.qualityInspection
            where measurement.id = :measurementId
            """)
    Optional<QualityMeasurement> findByIdForUpdate(
            @Param("measurementId") Long measurementId
    );
}
