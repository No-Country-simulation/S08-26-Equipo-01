package com.nocountry.qualitytrack.documents.repository;

import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "materialLot",
            "materialLot.material",
            "createdBy"
    })
    @Query("""
            select document
            from Document document
            left join document.jobCase jobCase
            left join jobCase.customerRequest request
            left join request.customer customer
            left join document.materialLot materialLot
            left join materialLot.material material
            where document.status = :status
              and (
                    lower(document.name) like :pattern
                    or lower(document.documentType) like :pattern
                    or lower(coalesce(document.description, '')) like :pattern
                    or lower(coalesce(jobCase.caseNumber, '')) like :pattern
                    or lower(coalesce(request.requestNumber, '')) like :pattern
                    or lower(coalesce(customer.name, '')) like :pattern
                    or lower(coalesce(materialLot.lotNumber, '')) like :pattern
                    or lower(coalesce(material.code, '')) like :pattern
                    or exists (
                        select version.id
                        from DocumentVersion version
                        where version.document = document
                          and lower(version.fileName) like :pattern
                    )
              )
            order by document.createdAt desc, document.id desc
            """)
    List<Document> searchInternal(
            @Param("status") DocumentStatus status,
            @Param("pattern") String pattern,
            Pageable pageable
    );

    @Override
    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "materialLot",
            "materialLot.material",
            "createdBy",
            "removedBy"
    })
    Optional<Document> findById(Long id);

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdBy"
    })
    Optional<Document> findByIdAndJobCase_IdAndStatus(
            Long documentId,
            Long caseId,
            DocumentStatus status
    );

    @EntityGraph(attributePaths = {
            "jobCase",
            "createdBy"
    })
    List<Document> findAllByJobCase_IdAndStatusOrderByCreatedAtAsc(
            Long caseId,
            DocumentStatus status
    );

    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
            "createdBy"
    })
    @Query("""
            select distinct d
            from Document d
            left join d.jobCase jc
            left join jc.customerRequest cr
            left join cr.customer cust
            left join d.materialLot ownedLot
            where d.status = :status
              and (:caseId is null or jc.id = :caseId)
              and (:customerId is null or cust.id = :customerId)
              and (:documentType is null or d.documentType = :documentType)
              and (
                    :workOrderId is null
                    or exists (
                        select wod.id
                        from WorkOrderDocument wod
                        where wod.document = d
                          and wod.workOrder.id = :workOrderId
                    )
                    or exists (
                        select wom.id
                        from WorkOrderMaterial wom
                        where wom.workOrder.id = :workOrderId
                          and wom.materialLot.certificateDocumentVersion.document = d
                    )
                    or exists (
                        select delivery.id
                        from Delivery delivery
                        where delivery.workOrder.id = :workOrderId
                          and delivery.evidenceDocumentVersion.document = d
                    )
              )
              and (
                    :materialLotId is null
                    or ownedLot.id = :materialLotId
                    or exists (
                        select lot.id
                        from MaterialLot lot
                        where lot.certificateDocumentVersion.document = d
                          and lot.id = :materialLotId
                    )
              )
              and (
                    :deliveryId is null
                    or exists (
                        select del.id
                        from Delivery del
                        where del.evidenceDocumentVersion.document = d
                          and del.id = :deliveryId
                    )
              )
            order by d.createdAt desc, d.id desc
            """)
    List<Document> searchActiveForCenter(
            @Param("status") DocumentStatus status,
            @Param("caseId") Long caseId,
            @Param("customerId") Long customerId,
            @Param("documentType") String documentType,
            @Param("workOrderId") Long workOrderId,
            @Param("materialLotId") Long materialLotId,
            @Param("deliveryId") Long deliveryId
    );

    @EntityGraph(attributePaths = {
            "materialLot",
            "materialLot.material",
            "createdBy"
    })
    Optional<Document> findByMaterialLot_IdAndDocumentTypeAndStatus(
            Long materialLotId,
            String documentType,
            DocumentStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select d
            from Document d
            join fetch d.materialLot lot
            join fetch lot.material
            join fetch d.createdBy
            where lot.id = :materialLotId
              and d.documentType = :documentType
              and d.status = :status
            """)
    Optional<Document> findByMaterialLotAndTypeAndStatusForUpdate(
            @Param("materialLotId") Long materialLotId,
            @Param("documentType") String documentType,
            @Param("status") DocumentStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select d
            from Document d
            join fetch d.jobCase jc
            join fetch jc.customerRequest cr
            join fetch cr.customer c
            join fetch d.createdBy
            where d.id = :documentId
              and jc.id = :caseId
              and d.status = :status
            """)
    Optional<Document> findByIdAndCaseIdAndStatusForUpdate(
            @Param("documentId") Long documentId,
            @Param("caseId") Long caseId,
            @Param("status") DocumentStatus status
    );
}
