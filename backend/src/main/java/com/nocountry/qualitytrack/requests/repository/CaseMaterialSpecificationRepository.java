package com.nocountry.qualitytrack.requests.repository;

import com.nocountry.qualitytrack.requests.entity.CaseMaterialSpecification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CaseMaterialSpecificationRepository extends JpaRepository<CaseMaterialSpecification, Long> {

    Optional<CaseMaterialSpecification> findByJobCase_Id(Long caseId);
}
