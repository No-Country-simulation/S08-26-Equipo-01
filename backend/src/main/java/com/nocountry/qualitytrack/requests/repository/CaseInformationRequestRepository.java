package com.nocountry.qualitytrack.requests.repository;

import com.nocountry.qualitytrack.requests.entity.CaseInformationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CaseInformationRequestRepository extends JpaRepository<CaseInformationRequest, Long> {

    boolean existsByJobCase_IdAndRespondedAtIsNull(Long caseId);

    Optional<CaseInformationRequest> findByIdAndJobCase_Id(Long id, Long caseId);

    List<CaseInformationRequest> findAllByJobCase_IdOrderByRequestedAtAsc(Long caseId);
}
