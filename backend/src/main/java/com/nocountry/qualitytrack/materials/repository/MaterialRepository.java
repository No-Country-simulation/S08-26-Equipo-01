package com.nocountry.qualitytrack.materials.repository;

import com.nocountry.qualitytrack.materials.entity.Material;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {

    @Query("""
            select material
            from Material material
            where lower(material.code) like :pattern
               or lower(material.name) like :pattern
               or lower(coalesce(material.specification, '')) like :pattern
            order by material.updatedAt desc, material.id desc
            """)
    List<Material> searchInternal(
            @Param("pattern") String pattern,
            Pageable pageable
    );

    boolean existsByCodeIgnoreCase(String code);
}
