package com.nocountry.qualitytrack.machines.repository;

import com.nocountry.qualitytrack.machines.entity.Machine;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MachineRepository extends JpaRepository<Machine, Long> {

    boolean existsByCodeIgnoreCase(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select machine from Machine machine where machine.id = :machineId")
    Optional<Machine> findByIdForUpdate(@Param("machineId") Long machineId);
}
