package com.nocountry.qualitytrack.documents.repository;

import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

    @Query("""
            select coalesce(max(v.version), 0)
            from DocumentVersion v
            where v.document.id = :documentId
            """)
    int findMaxVersionByDocumentId(@Param("documentId") Long documentId);

    @EntityGraph(attributePaths = {"uploadedBy"})
    List<DocumentVersion> findAllByDocument_IdOrderByVersionAsc(Long documentId);

    @Query("""
            select v
            from DocumentVersion v
            join fetch v.uploadedBy
            join fetch v.document d
            where d.id in :documentIds
              and v.version = (
                    select max(v2.version)
                    from DocumentVersion v2
                    where v2.document.id = d.id
              )
            """)
    List<DocumentVersion> findLatestByDocumentIds(@Param("documentIds") List<Long> documentIds);

    @EntityGraph(attributePaths = {
            "uploadedBy",
            "document",
            "document.jobCase",
            "document.jobCase.customerRequest",
            "document.jobCase.customerRequest.customer",
            "document.createdBy"
    })
    Optional<DocumentVersion> findByIdAndDocument_IdAndDocument_JobCase_IdAndDocument_Status(
            Long versionId,
            Long documentId,
            Long caseId,
            DocumentStatus status
    );
}
