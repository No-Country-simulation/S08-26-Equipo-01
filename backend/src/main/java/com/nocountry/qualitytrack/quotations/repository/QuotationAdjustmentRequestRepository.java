package com.nocountry.qualitytrack.quotations.repository;

import com.nocountry.qualitytrack.quotations.entity.QuotationAdjustmentRequest;
import com.nocountry.qualitytrack.quotations.enums.QuotationAdjustmentStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface QuotationAdjustmentRequestRepository
        extends JpaRepository<QuotationAdjustmentRequest, Long> {

    boolean existsByDraftQuotation_IdAndStatus(
            Long draftQuotationId,
            QuotationAdjustmentStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select request
            from QuotationAdjustmentRequest request
            where request.draftQuotation.id = :draftQuotationId
              and request.status = :status
            """)
    Optional<QuotationAdjustmentRequest> findByDraftQuotationIdAndStatusForUpdate(
            @Param("draftQuotationId") Long draftQuotationId,
            @Param("status") QuotationAdjustmentStatus status
    );

    @Query("""
            select request.draftQuotation.id
            from QuotationAdjustmentRequest request
            where request.status = com.nocountry.qualitytrack.quotations.enums.QuotationAdjustmentStatus.OPEN
              and request.draftQuotation.id in :draftQuotationIds
            """)
    List<Long> findOpenDraftQuotationIds(
            @Param("draftQuotationIds") Collection<Long> draftQuotationIds
    );
}
