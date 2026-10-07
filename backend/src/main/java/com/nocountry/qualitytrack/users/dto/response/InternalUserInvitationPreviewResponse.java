package com.nocountry.qualitytrack.users.dto.response;

import com.nocountry.qualitytrack.users.enums.SystemRole;

import java.time.Instant;
import java.util.Set;

public record InternalUserInvitationPreviewResponse(
        String firstName,
        String lastName,
        String email,
        Set<SystemRole> roles,
        Instant expiresAt
) {
}
