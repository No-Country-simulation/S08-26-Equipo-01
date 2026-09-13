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
