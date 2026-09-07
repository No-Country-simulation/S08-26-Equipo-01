package com.nocountry.qualitytrack.auth.dto.response;

import com.nocountry.qualitytrack.users.enums.UserStatus;

public record RegisterResponse(
        Long userId,
        String email,
        UserStatus status
) {
}
