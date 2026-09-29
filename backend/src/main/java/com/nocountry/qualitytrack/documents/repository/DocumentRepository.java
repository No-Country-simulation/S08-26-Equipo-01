package com.nocountry.qualitytrack.documents.repository;

import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    @Override
    @EntityGraph(attributePaths = {
            "jobCase",
            "jobCase.customerRequest",
            "jobCase.customerRequest.customer",
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
            join d.jobCase jc
            join jc.customerRequest cr
            join cr.customer cust
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
