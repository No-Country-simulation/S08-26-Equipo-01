package com.nocountry.qualitytrack.auth.dto.response;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn
) {
}
