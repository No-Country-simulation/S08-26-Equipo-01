package com.nocountry.qualitytrack.auth.security;

import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ActiveUserJwtValidatorTest {

    @Mock
    private UserRepository userRepository;

    private ActiveUserJwtValidator validator;

    @BeforeEach
    void setUp() {
        validator = new ActiveUserJwtValidator(userRepository);
    }

    @Test
    void acceptsTokenForActiveUser() {
        Jwt jwt = jwtWithSubject("42");
        when(userRepository.existsByIdAndStatus(42L, UserStatus.ACTIVE))
                .thenReturn(true);

        OAuth2TokenValidatorResult result = validator.validate(jwt);

        assertFalse(result.hasErrors());
        verify(userRepository).existsByIdAndStatus(42L, UserStatus.ACTIVE);
    }

    @Test
    void rejectsTokenForSuspendedOrInactiveUser() {
        Jwt jwt = jwtWithSubject("42");
        when(userRepository.existsByIdAndStatus(42L, UserStatus.ACTIVE))
                .thenReturn(false);

        OAuth2TokenValidatorResult result = validator.validate(jwt);

        assertTrue(result.hasErrors());
        verify(userRepository).existsByIdAndStatus(42L, UserStatus.ACTIVE);
    }

    @Test
    void rejectsTokenWhenUserNoLongerExists() {
        Jwt jwt = jwtWithSubject("99");
        when(userRepository.existsByIdAndStatus(99L, UserStatus.ACTIVE))
                .thenReturn(false);

        OAuth2TokenValidatorResult result = validator.validate(jwt);

        assertTrue(result.hasErrors());
    }

    @Test
    void rejectsTokenWithNonNumericSubjectWithoutQueryingDatabase() {
        Jwt jwt = jwtWithSubject("not-a-user-id");

        OAuth2TokenValidatorResult result = validator.validate(jwt);

        assertTrue(result.hasErrors());
        verifyNoInteractions(userRepository);
    }

    @Test
    void rejectsTokenWithoutSubjectWithoutQueryingDatabase() {
        Jwt jwt = jwtWithSubject(null);

        OAuth2TokenValidatorResult result = validator.validate(jwt);

        assertTrue(result.hasErrors());
        verifyNoInteractions(userRepository);
    }

    private Jwt jwtWithSubject(String subject) {
        Jwt jwt = mock(Jwt.class);
        when(jwt.getSubject()).thenReturn(subject);
        return jwt;
    }
}
