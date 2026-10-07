package com.nocountry.qualitytrack.users.service;

import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class DemoAccountPolicy {

    private final UserRepository userRepository;

    @Value("${app.demo.enabled:false}")
    private boolean demoEnabled;

    @Value("${app.demo.internal-email:admin.demo@qualitytrack.com}")
    private String internalDemoEmail;

    @Value("${app.demo.customer-email:cliente.demo@qualitytrack.com}")
    private String customerDemoEmail;

    public void requireIdentityMutationAllowed(Long userId) {
        if (!demoEnabled) return;

        User user = userRepository.findById(userId).orElse(null);
        if (user == null || !isDemoEmail(user.getEmail())) return;

        throw new BusinessException(
                ApiErrorCode.ACCESS_DENIED,
                "Esta acción está deshabilitada para la cuenta de demostración."
        );
    }

    public boolean isDemoUser(Long userId) {
        if (!demoEnabled) return false;
        return userRepository.findById(userId)
                .map(User::getEmail)
                .map(this::isDemoEmail)
                .orElse(false);
    }

    private boolean isDemoEmail(String email) {
        if (email == null) return false;
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return normalized.equals(normalize(internalDemoEmail))
                || normalized.equals(normalize(customerDemoEmail));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
