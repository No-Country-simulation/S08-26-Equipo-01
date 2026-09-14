package com.nocountry.qualitytrack.users.bootstrap;

import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class InternalAdminBootstrapService {

    private static final Pattern SIMPLE_EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final UserRepository userRepository;
    private final UserSystemRoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void bootstrap(BootstrapAdminProperties properties) {
        if (!properties.isEnabled()) {
            return;
        }

        if (roleRepository.existsById_RoleAndUser_AccountType(SystemRole.ADMIN, AccountType.INTERNAL)) {
            log.info("Bootstrap de administrador omitido: ya existe un administrador interno.");
            return;
        }

        String firstName = requireText(properties.getFirstName(), "APP_BOOTSTRAP_ADMIN_FIRST_NAME", 100);
        String lastName = requireText(properties.getLastName(), "APP_BOOTSTRAP_ADMIN_LAST_NAME", 100);
        String email = normalizeEmail(properties.getEmail());
        String password = validatePassword(properties.getPassword());

        userRepository.findByEmailIgnoreCase(email).ifPresent(existingUser -> {
            throw new IllegalStateException(
                    "No fue posible crear el administrador inicial: el correo configurado ya pertenece a otra cuenta."
            );
        });

        User admin = User.createActiveInternal(
                firstName,
                lastName,
                email,
                passwordEncoder.encode(password)
        );

        User savedAdmin;
        try {
            savedAdmin = userRepository.saveAndFlush(admin);
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalStateException(
                    "No fue posible crear el administrador inicial porque el correo configurado ya está en uso.",
                    exception
            );
        }

        roleRepository.saveAndFlush(new UserSystemRole(savedAdmin, SystemRole.ADMIN));
        log.info("Administrador interno inicial creado correctamente para {}.", savedAdmin.getEmail());
    }

    private String requireText(String value, String propertyName, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(propertyName + " es obligatorio cuando el bootstrap está habilitado.");
        }

        String normalized = value.trim();
        if (normalized.length() > maxLength) {
            throw new IllegalStateException(propertyName + " no puede superar los " + maxLength + " caracteres.");
        }

        return normalized;
    }

    private String normalizeEmail(String value) {
        String email = requireText(value, "APP_BOOTSTRAP_ADMIN_EMAIL", 254)
                .toLowerCase(Locale.ROOT);

        if (!SIMPLE_EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalStateException("APP_BOOTSTRAP_ADMIN_EMAIL no tiene un formato válido.");
        }

        return email;
    }

    private String validatePassword(String value) {
        if (value == null || value.length() < 8) {
            throw new IllegalStateException(
                    "APP_BOOTSTRAP_ADMIN_PASSWORD debe contener al menos 8 caracteres."
            );
        }

        if (value.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new IllegalStateException(
                    "APP_BOOTSTRAP_ADMIN_PASSWORD no puede superar los 72 bytes en UTF-8."
            );
        }

        return value;
    }
}
