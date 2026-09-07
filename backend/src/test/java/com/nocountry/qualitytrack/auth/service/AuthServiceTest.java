package com.nocountry.qualitytrack.auth.service;

import com.nocountry.qualitytrack.auth.dto.request.LoginRequest;
import com.nocountry.qualitytrack.auth.dto.response.LoginResponse;
import com.nocountry.qualitytrack.auth.security.JwtService;
import com.nocountry.qualitytrack.auth.security.SecurityUser;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    private AuthService service;

    @BeforeEach
    void setUp() {
        service = new AuthService(authenticationManager, jwtService);
    }

    @Test
    void returnsJwtForValidCredentials() {
        SecurityUser user = new SecurityUser(
                42L,
                "edgar@example.com",
                "hash",
                AccountType.CUSTOMER,
                UserStatus.ACTIVE,
                List.of()
        );
        Authentication authentication = new UsernamePasswordAuthenticationToken(user, null, List.of());

        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(authentication);
        when(jwtService.generate(user)).thenReturn(new JwtService.GeneratedJwt("jwt-token", 900));

        LoginResponse response = service.login(new LoginRequest("EDGAR@example.com", "password"));

        assertEquals("jwt-token", response.accessToken());
        assertEquals("Bearer", response.tokenType());
        assertEquals(900, response.expiresIn());
    }

    @Test
    void returnsGenericUnauthorizedErrorForInvalidCredentials() {
        when(authenticationManager.authenticate(any(Authentication.class)))
                .thenThrow(new BadCredentialsException("bad credentials"));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.login(new LoginRequest("edgar@example.com", "wrong-password"))
        );

        assertEquals(ApiErrorCode.INVALID_CREDENTIALS, exception.getCode());
        assertEquals("El correo electrónico o la contraseña son incorrectos.", exception.getMessage());
    }
}
