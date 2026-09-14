package com.nocountry.qualitytrack.users.dto.response;

import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;

import java.util.Set;

public record InternalUserInvitationAcceptResponse(
        Long userId,
        String email,
        Set<SystemRole> roles,
        UserStatus status
) {
}
