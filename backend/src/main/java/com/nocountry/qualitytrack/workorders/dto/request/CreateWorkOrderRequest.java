package com.nocountry.qualitytrack.workorders.dto.request;

import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CreateWorkOrderRequest(
        @NotNull(message = "La prioridad es obligatoria.")
        WorkOrderPriority priority,

        @NotNull(message = "La fecha de inicio planeada es obligatoria.")
        LocalDate plannedStartDate,

        @NotNull(message = "La fecha de fin planeada es obligatoria.")
        LocalDate plannedEndDate
) {
}
