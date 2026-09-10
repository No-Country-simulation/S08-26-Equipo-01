package com.nocountry.qualitytrack.auth.controller;

import com.nocountry.qualitytrack.auth.documentation.ForgotPasswordApiDocs;
import com.nocountry.qualitytrack.auth.documentation.LoginApiDocs;
import com.nocountry.qualitytrack.auth.documentation.RegisterApiDocs;
import com.nocountry.qualitytrack.auth.documentation.ResendVerificationApiDocs;
import com.nocountry.qualitytrack.auth.documentation.ResetPasswordApiDocs;
import com.nocountry.qualitytrack.auth.documentation.VerifyEmailApiDocs;
import com.nocountry.qualitytrack.auth.dto.request.ForgotPasswordRequest;
import com.nocountry.qualitytrack.auth.dto.request.LoginRequest;
import com.nocountry.qualitytrack.auth.dto.request.RegisterRequest;
import com.nocountry.qualitytrack.auth.dto.request.ResendVerificationRequest;
import com.nocountry.qualitytrack.auth.dto.request.ResetPasswordRequest;
import com.nocountry.qualitytrack.auth.dto.request.VerifyEmailRequest;
import com.nocountry.qualitytrack.auth.dto.response.LoginResponse;
import com.nocountry.qualitytrack.auth.dto.response.RegisterResponse;
import com.nocountry.qualitytrack.auth.service.AuthService;
import com.nocountry.qualitytrack.auth.service.EmailVerificationService;
import com.nocountry.qualitytrack.auth.service.PasswordRecoveryService;
import com.nocountry.qualitytrack.auth.service.RegistrationService;
import com.nocountry.qualitytrack.shared.response.ApiResponse;
import com.nocountry.qualitytrack.shared.response.ApiSuccessCode;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(
        name = "01 · Autenticación",
        description = "Registro de clientes, verificación de correo, autenticación y recuperación de contraseña."
)
public class AuthController {

    private final RegistrationService registrationService;
    private final EmailVerificationService emailVerificationService;
    private final AuthService authService;
    private final PasswordRecoveryService passwordRecoveryService;

    @RegisterApiDocs
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = registrationService.registerCustomer(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        ApiSuccessCode.AUTH_REGISTERED,
                        "Registro completado. Verifica tu correo electrónico para activar la cuenta.",
                        response
                ));
    }

    @VerifyEmailApiDocs
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        emailVerificationService.verify(request.token());

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.EMAIL_VERIFIED,
                "Correo electrónico verificado correctamente.",
                null
        ));
    }

    @ResendVerificationApiDocs
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request
    ) {
        emailVerificationService.resend(request.email());

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success(
                        ApiSuccessCode.VERIFICATION_EMAIL_SENT,
                        "Si la cuenta cumple con los requisitos, se enviará un correo de verificación.",
                        null
                ));
    }

    @LoginApiDocs
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.AUTHENTICATED,
                "Autenticación exitosa.",
                response
        ));
    }

    @ForgotPasswordApiDocs
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordRecoveryService.requestReset(request.email());

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ApiResponse.success(
                        ApiSuccessCode.PASSWORD_RESET_EMAIL_SENT,
                        "Si existe una cuenta asociada a ese correo, se enviarán las instrucciones para restablecer la contraseña.",
                        null
                ));
    }

    @ResetPasswordApiDocs
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordRecoveryService.resetPassword(request.token(), request.newPassword());

        return ResponseEntity.ok(ApiResponse.success(
                ApiSuccessCode.PASSWORD_RESET_COMPLETED,
                "Contraseña restablecida correctamente.",
                null
        ));
    }
}
