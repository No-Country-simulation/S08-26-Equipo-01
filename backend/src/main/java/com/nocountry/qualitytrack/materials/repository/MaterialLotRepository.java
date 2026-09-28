package com.nocountry.qualitytrack.materials.repository;

import com.nocountry.qualitytrack.materials.entity.MaterialLot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MaterialLotRepository extends JpaRepository<MaterialLot, Long> {

    boolean existsByMaterial_IdAndLotNumberIgnoreCase(Long materialId, String lotNumber);

    @EntityGraph(attributePaths = {"material", "certificateDocumentVersion"})
    List<MaterialLot> findAllByMaterial_IdOrderByReceivedAtDesc(Long materialId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select lot
            from MaterialLot lot
            join fetch lot.material
            left join fetch lot.certificateDocumentVersion
            where lot.id = :lotId
            """)
    Optional<MaterialLot> findByIdForUpdate(@Param("lotId") Long lotId);
}
