package com.nocountry.qualitytrack.users.dto.response;

import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;

import java.time.Instant;
import java.util.Set;

public record InternalUserInvitationResponse(
        Long userId,
        String firstName,
        String lastName,
        String email,
        Set<SystemRole> roles,
        UserStatus status,
        Instant expiresAt
) {
}
