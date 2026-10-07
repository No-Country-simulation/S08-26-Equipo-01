package com.nocountry.qualitytrack.workorders.repository;

import com.nocountry.qualitytrack.workorders.entity.WorkOrderDocument;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkOrderDocumentRepository extends JpaRepository<WorkOrderDocument, Long> {

    boolean existsByDocument_Id(Long documentId);

    boolean existsByWorkOrder_Id(Long workOrderId);

    @EntityGraph(attributePaths = {
            "workOrder",
            "documentVersion"
    })
    List<WorkOrderDocument> findAllByDocument_IdOrderByWorkOrder_IdAsc(Long documentId);

    @Query("""
            select reference
            from WorkOrderDocument reference
            join fetch reference.workOrder
            join fetch reference.document
            join fetch reference.documentVersion
            where reference.document.id in :documentIds
            order by reference.document.id asc, reference.workOrder.id asc
            """)
    List<WorkOrderDocument> findAllByDocumentIds(
            @Param("documentIds") List<Long> documentIds
    );

    @EntityGraph(attributePaths = {
            "document",
            "documentVersion",
            "linkedByUser"
    })
    List<WorkOrderDocument> findAllByWorkOrder_IdOrderByLinkedAtAsc(Long workOrderId);

    @EntityGraph(attributePaths = {
            "workOrder",
            "document",
            "documentVersion",
            "linkedByUser"
    })
    Optional<WorkOrderDocument> findByWorkOrder_IdAndDocument_Id(
            Long workOrderId,
            Long documentId
    );
}
