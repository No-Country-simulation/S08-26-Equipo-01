package com.nocountry.qualitytrack.auth.service;

import com.nocountry.qualitytrack.auth.dto.request.LoginRequest;
import com.nocountry.qualitytrack.auth.dto.response.LoginResponse;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.enums.AccountType;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DemoAuthService {

    private final AuthService authService;

    @Value("${app.demo.enabled:false}")
    private boolean enabled;

    @Value("${app.demo.password:}")
    private String demoPassword;

    @Value("${app.demo.internal-email:admin.demo@qualitytrack.com}")
    private String internalEmail;

    @Value("${app.demo.customer-email:cliente.demo@qualitytrack.com}")
    private String customerEmail;

    public LoginResponse login(AccountType accountType) {
        if (!enabled) {
            throw new BusinessException(
                    ApiErrorCode.RESOURCE_NOT_FOUND,
                    "El acceso de demostración no está habilitado."
            );
        }

        if (demoPassword == null || demoPassword.isBlank()) {
            throw new BusinessException(
                    ApiErrorCode.INTERNAL_ERROR,
                    "El acceso de demostración no está configurado correctamente."
            );
        }

        String email = switch (accountType) {
            case INTERNAL -> internalEmail;
            case CUSTOMER -> customerEmail;
        };

        return authService.login(new LoginRequest(email, demoPassword));
    }
}
