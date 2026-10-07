package com.nocountry.qualitytrack.auth.dto.request;

import com.nocountry.qualitytrack.users.enums.AccountType;
import jakarta.validation.constraints.NotNull;

public record DemoLoginRequest(
        @NotNull AccountType accountType
) {
}
