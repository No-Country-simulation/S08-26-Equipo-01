package com.nocountry.qualitytrack.workorders.repository;

import com.nocountry.qualitytrack.workorders.entity.WorkOrderDocument;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkOrderDocumentRepository extends JpaRepository<WorkOrderDocument, Long> {

    boolean existsByDocument_Id(Long documentId);

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
