package com.nocountry.qualitytrack.materials.repository;

import com.nocountry.qualitytrack.materials.entity.Material;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MaterialRepository extends JpaRepository<Material, Long> {

    boolean existsByCodeIgnoreCase(String code);
}
