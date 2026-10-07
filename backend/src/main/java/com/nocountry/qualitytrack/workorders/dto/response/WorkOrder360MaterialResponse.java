package com.nocountry.qualitytrack.workorders.dto.response;

import com.nocountry.qualitytrack.materials.dto.response.MaterialLotResponse;
import com.nocountry.qualitytrack.materials.dto.response.WorkOrderMaterialResponse;

public record WorkOrder360MaterialResponse(
        WorkOrderMaterialResponse consumption,
        MaterialLotResponse lot
) {
}
