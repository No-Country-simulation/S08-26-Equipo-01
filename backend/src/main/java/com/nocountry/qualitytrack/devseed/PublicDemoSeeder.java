package com.nocountry.qualitytrack.devseed;

import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerResponse;
import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.customers.service.CustomerService;
import com.nocountry.qualitytrack.requests.repository.CustomerRequestRepository;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Component
@Profile("!seed-demo")
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
@RequiredArgsConstructor
@Slf4j
public class PublicDemoSeeder {

    private static final String DATASET_MARKER_REFERENCE = "MP-2026-001";
    private static final List<SystemRole> PUBLIC_DEMO_ROLES = List.of(
            SystemRole.ADMIN,
            SystemRole.COMMERCIAL,
            SystemRole.ENGINEERING,
            SystemRole.PRODUCTION,
            SystemRole.QUALITY,
            SystemRole.LOGISTICS,
            SystemRole.AUDITOR
    );

    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;
    private final CustomerRepository customerRepository;
    private final CustomerMembershipRepository customerMembershipRepository;
    private final CustomerRequestRepository customerRequestRepository;
    private final CustomerService customerService;
    private final PasswordEncoder passwordEncoder;
    private final DemoCommercialSeeder commercialSeeder;
    private final DemoOperationsSeeder operationsSeeder;

    @Value("${app.demo.password:}")
    private String demoPassword;

    @Value("${app.demo.internal-email:admin.demo@qualitytrack.com}")
    private String internalEmail;

    @Value("${app.demo.customer-email:cliente.demo@qualitytrack.com}")
    private String customerEmail;

    @EventListener(ApplicationReadyEvent.class)
    @Order(Ordered.LOWEST_PRECEDENCE)
    @Transactional
    public void seedAfterStartup() {
        requireConfiguredPassword();

        User internalAdmin = ensureInternalAdmin();
        DemoCustomer demoCustomer = ensureDemoCustomer();

        if (customerRequestRepository.existsByCustomer_IdAndCustomerReference(
                demoCustomer.customer().getId(),
                DATASET_MARKER_REFERENCE
        )) {
            log.info("Public QualityTrack demo dataset already exists. Accounts refreshed.");
            return;
        }

        DemoInternalActors actors = new DemoInternalActors(
                internalAdmin,
                internalAdmin,
                internalAdmin,
                internalAdmin,
                internalAdmin,
                internalAdmin
        );

        log.info("Creating public QualityTrack demo scenarios for {}...", demoCustomer.customer().getName());

        commercialSeeder.seedReviewScenarios(actors, demoCustomer);
        commercialSeeder.seedQuotationScenarios(actors, demoCustomer, demoCustomer);
        operationsSeeder.seedWorkOrderScenarios(actors, demoCustomer, demoCustomer);
        operationsSeeder.seedQualityAndDeliveryScenarios(actors, demoCustomer, demoCustomer);

        log.info("Public QualityTrack demo dataset completed.");
    }

    private User ensureInternalAdmin() {
        String email = normalizeEmail(internalEmail);
        String passwordHash = passwordEncoder.encode(demoPassword);

        User user = userRepository.findByEmailIgnoreCase(email)
                .map(existing -> refreshInternal(existing, passwordHash))
                .orElseGet(() -> userRepository.saveAndFlush(
                        User.createActiveInternal(
                                "Administrador",
                                "Demo",
                                email,
                                passwordHash
                        )
                ));

        for (SystemRole role : PUBLIC_DEMO_ROLES) {
            if (!userSystemRoleRepository.existsByIdUserIdAndIdRole(user.getId(), role)) {
                userSystemRoleRepository.saveAndFlush(new UserSystemRole(user, role));
            }
        }

        return user;
    }

    private User refreshInternal(User user, String passwordHash) {
        if (user.getAccountType() != AccountType.INTERNAL) {
            throw new IllegalStateException(
                    "El correo de demo interna ya pertenece a una cuenta no interna."
            );
        }

        if (user.getStatus() == UserStatus.PENDING_ACTIVATION) {
            user.activateInternal(passwordHash, Instant.now());
        } else {
            if (user.getStatus() == UserStatus.SUSPENDED) {
                user.reactivateInternal();
            }
            user.changePassword(passwordHash);
        }

        user.updateProfile("Administrador", "Demo");
        return userRepository.saveAndFlush(user);
    }

    private DemoCustomer ensureDemoCustomer() {
        String email = normalizeEmail(customerEmail);
        String passwordHash = passwordEncoder.encode(demoPassword);

        User owner = userRepository.findByEmailIgnoreCase(email)
                .map(existing -> refreshCustomer(existing, passwordHash))
                .orElseGet(() -> {
                    User created = User.registerCustomer(
                            "Mariana",
                            "Torres",
                            email,
                            passwordHash
                    );
                    created.verifyEmail(Instant.now());
                    return userRepository.saveAndFlush(created);
                });

        Customer existingCustomer = customerMembershipRepository
                .findAllByUser_IdAndStatusOrderByCreatedAtAsc(
                        owner.getId(),
                        CustomerMembershipStatus.ACTIVE
                )
                .stream()
                .filter(membership -> membership.getRole() == CustomerMembershipRole.ADMIN)
                .map(CustomerMembership::getCustomer)
                .findFirst()
                .orElse(null);

        if (existingCustomer != null) {
            return new DemoCustomer(owner, existingCustomer);
        }

        CustomerResponse response = customerService.createCustomer(
                owner.getId(),
                new CreateCustomerRequest(
                        "Industrias Nova S.A. de C.V.",
                        "INO261006NV1",
                        "311-555-0188",
                        "administracion@industriasnova.demo",
                        "Tepic",
                        "Nayarit",
                        "https://industriasnova.example"
                )
        );

        Customer customer = customerRepository.findById(response.id())
                .orElseThrow(() -> new IllegalStateException(
                        "No se pudo recuperar Industrias Nova después de crearla."
                ));

        return new DemoCustomer(owner, customer);
    }

    private User refreshCustomer(User user, String passwordHash) {
        if (user.getAccountType() != AccountType.CUSTOMER) {
            throw new IllegalStateException(
                    "El correo de demo cliente ya pertenece a una cuenta no cliente."
            );
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new IllegalStateException(
                    "La cuenta demo cliente está suspendida y requiere revisión administrativa."
            );
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            user.verifyEmail(Instant.now());
        }

        user.changePassword(passwordHash);
        user.updateProfile("Mariana", "Torres");
        return userRepository.saveAndFlush(user);
    }

    private void requireConfiguredPassword() {
        if (demoPassword == null || demoPassword.isBlank()) {
            throw new IllegalStateException(
                    "APP_DEMO_ENABLED=true requiere configurar APP_DEMO_PASSWORD."
            );
        }
        if (demoPassword.length() < 12) {
            throw new IllegalStateException(
                    "APP_DEMO_PASSWORD debe tener al menos 12 caracteres."
            );
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalStateException("Los correos de demo deben estar configurados.");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
