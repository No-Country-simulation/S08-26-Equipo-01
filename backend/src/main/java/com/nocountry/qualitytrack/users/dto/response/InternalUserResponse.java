package com.nocountry.qualitytrack.users.dto.response;

import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;

import java.time.Instant;
import java.util.List;
import java.util.Set;

public record InternalUserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        UserStatus status,
        List<SystemRole> roles,
        Instant createdAt,
        Instant updatedAt
) {
    public static InternalUserResponse from(User user, Set<SystemRole> roles) {
        return new InternalUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getStatus(),
                List.copyOf(roles),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
