package com.nocountry.qualitytrack.materials.repository;

import com.nocountry.qualitytrack.materials.entity.MaterialLot;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MaterialLotRepository extends JpaRepository<MaterialLot, Long> {

    @EntityGraph(attributePaths = {
            "material",
            "certificateDocumentVersion",
            "certificateDocumentVersion.document"
    })
    @Query("""
            select lot
            from MaterialLot lot
            join lot.material material
            where lower(lot.lotNumber) like :pattern
               or lower(coalesce(lot.supplier, '')) like :pattern
               or lower(material.code) like :pattern
               or lower(material.name) like :pattern
            order by lot.receivedAt desc, lot.id desc
            """)
    List<MaterialLot> searchInternal(
            @Param("pattern") String pattern,
            Pageable pageable
    );

    boolean existsByMaterial_IdAndLotNumberIgnoreCase(Long materialId, String lotNumber);

    boolean existsByCertificateDocumentVersion_Document_Id(Long documentId);

    @EntityGraph(attributePaths = {
            "certificateDocumentVersion",
            "certificateDocumentVersion.document"
    })
    List<MaterialLot> findAllByCertificateDocumentVersion_Document_IdOrderByIdAsc(Long documentId);

    @Query("""
            select lot
            from MaterialLot lot
            join fetch lot.certificateDocumentVersion version
            join fetch version.document document
            where document.id in :documentIds
            order by document.id asc, lot.id asc
            """)
    List<MaterialLot> findAllByCertificateDocumentIds(
            @Param("documentIds") List<Long> documentIds
    );

    @EntityGraph(attributePaths = {
            "material",
            "certificateDocumentVersion",
            "certificateDocumentVersion.document"
    })
    List<MaterialLot> findAllByMaterial_IdOrderByReceivedAtDesc(Long materialId);

    @EntityGraph(attributePaths = {
            "material",
            "certificateDocumentVersion",
            "certificateDocumentVersion.document"
    })
    List<MaterialLot> findAllByIdIn(List<Long> lotIds);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select lot
            from MaterialLot lot
            join fetch lot.material
            left join fetch lot.certificateDocumentVersion version
            left join fetch version.document
            where lot.id = :lotId
            """)
    Optional<MaterialLot> findByIdForUpdate(@Param("lotId") Long lotId);
}
