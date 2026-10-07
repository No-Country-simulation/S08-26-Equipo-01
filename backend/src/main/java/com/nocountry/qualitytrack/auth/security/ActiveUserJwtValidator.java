package com.nocountry.qualitytrack.auth.security;

import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2ErrorCodes;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ActiveUserJwtValidator implements OAuth2TokenValidator<Jwt> {

    private static final OAuth2Error INVALID_USER = new OAuth2Error(
            OAuth2ErrorCodes.INVALID_TOKEN,
            "The token does not identify an active user.",
            null
    );

    private final UserRepository userRepository;

    @Override
    public OAuth2TokenValidatorResult validate(Jwt token) {
        Long userId = parseUserId(token.getSubject());
        if (userId == null) {
            return OAuth2TokenValidatorResult.failure(INVALID_USER);
        }

        boolean active = userRepository.existsByIdAndStatus(
                userId,
                UserStatus.ACTIVE
        );

        return active
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(INVALID_USER);
    }

    private Long parseUserId(String subject) {
        if (subject == null || subject.isBlank()) {
            return null;
        }

        try {
            return Long.valueOf(subject);
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
