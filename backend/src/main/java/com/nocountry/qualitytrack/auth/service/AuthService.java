package com.nocountry.qualitytrack.auth.service;

import com.nocountry.qualitytrack.auth.dto.request.LoginRequest;
import com.nocountry.qualitytrack.auth.dto.response.LoginResponse;
import com.nocountry.qualitytrack.auth.security.JwtService;
import com.nocountry.qualitytrack.auth.security.SecurityUser;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public LoginResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.password())
            );

            SecurityUser user = (SecurityUser) authentication.getPrincipal();
            JwtService.GeneratedJwt jwt = jwtService.generate(user);

            return new LoginResponse(jwt.value(), "Bearer", jwt.expiresIn());
        } catch (AuthenticationException exception) {
            throw new BusinessException(
                    ApiErrorCode.INVALID_CREDENTIALS,
                    "El correo electrónico o la contraseña son incorrectos."
            );
        }
    }
}
