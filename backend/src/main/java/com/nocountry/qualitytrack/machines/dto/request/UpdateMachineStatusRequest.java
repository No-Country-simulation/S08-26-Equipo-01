package com.nocountry.qualitytrack.machines.dto.request;

import com.nocountry.qualitytrack.machines.enums.MachineStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateMachineStatusRequest(
        @NotNull(message = "El estado de la máquina es obligatorio.")
        MachineStatus status
) {
}
