package com.nocountry.qualitytrack.machines.dto.response;

import com.nocountry.qualitytrack.machines.entity.Machine;
import com.nocountry.qualitytrack.machines.enums.MachineStatus;

import java.time.Instant;

public record MachineResponse(
        Long id,
        String code,
        String name,
        String type,
        MachineStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static MachineResponse from(Machine machine) {
        return new MachineResponse(
                machine.getId(),
                machine.getCode(),
                machine.getName(),
                machine.getType(),
                machine.getStatus(),
                machine.getCreatedAt(),
                machine.getUpdatedAt()
        );
    }
}
