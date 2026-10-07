package com.nocountry.qualitytrack.devseed;

import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerResponse;
import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.customers.service.CustomerService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Locale;

@Component
@Profile("seed-demo")
@RequiredArgsConstructor
public class DemoIdentitySeeder {

    private final UserRepository userRepository;
    private final UserSystemRoleRepository userSystemRoleRepository;
    private final CustomerRepository customerRepository;
    private final CustomerMembershipRepository customerMembershipRepository;
    private final CustomerService customerService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo-seed.password}")
    private String demoPassword;

    DemoInternalActors createInternalActors(User admin) {
        return new DemoInternalActors(
                createInternalUser(
                        "Ana",
                        "López",
                        "ana.comercial@qualitytrack.test",
                        SystemRole.COMMERCIAL,
                        admin
                ),
                createInternalUser(
                        "Diego",
                        "Ruiz",
                        "diego.ingenieria@qualitytrack.test",
                        SystemRole.ENGINEERING,
                        admin
                ),
                createInternalUser(
                        "Carlos",
                        "Medina",
                        "carlos.produccion@qualitytrack.test",
                        SystemRole.PRODUCTION,
                        admin
                ),
                createInternalUser(
                        "Sofía",
                        "Torres",
                        "sofia.calidad@qualitytrack.test",
                        SystemRole.QUALITY,
                        admin
                ),
                createInternalUser(
                        "Luis",
                        "Navarro",
                        "luis.logistica@qualitytrack.test",
                        SystemRole.LOGISTICS,
                        admin
                ),
                admin
        );
    }

    void createCompletionMarker(User admin, String markerEmail) {
        createInternalUser(
                "Elena",
                "Vega",
                markerEmail,
                SystemRole.AUDITOR,
                admin
        );
    }

    DemoCustomer createCustomer(
            String firstName,
            String lastName,
            String ownerEmail,
            String companyName,
            String rfc,
            String phone,
            String administrativeEmail,
            String city,
            String state,
            String website
    ) {
        User owner = createActiveCustomerUser(firstName, lastName, ownerEmail);

        CustomerResponse response = customerService.createCustomer(
                owner.getId(),
                new CreateCustomerRequest(
                        companyName,
                        rfc,
                        phone,
                        administrativeEmail,
                        city,
                        state,
                        website
                )
        );

        Customer customer = customerRepository.findById(response.id())
                .orElseThrow(() -> new IllegalStateException(
                        "No se pudo recuperar el cliente demo recién creado."
                ));

        return new DemoCustomer(owner, customer);
    }

    void addCustomerRequester(
            DemoCustomer demoCustomer,
            String firstName,
            String lastName,
            String email
    ) {
        User requester = createActiveCustomerUser(firstName, lastName, email);

        customerMembershipRepository.saveAndFlush(
                CustomerMembership.acceptedInvitation(
                        demoCustomer.customer(),
                        requester,
                        CustomerMembershipRole.REQUESTER,
                        demoCustomer.owner(),
                        Instant.now()
                )
        );
    }

    private User createInternalUser(
            String firstName,
            String lastName,
            String email,
            SystemRole role,
            User assignedBy
    ) {
        User user = User.createActiveInternal(
                firstName,
                lastName,
                normalizeEmail(email),
                passwordEncoder.encode(demoPassword)
        );
        user = userRepository.saveAndFlush(user);

        userSystemRoleRepository.saveAndFlush(
                new UserSystemRole(user, role, assignedBy)
        );

        return user;
    }

    private User createActiveCustomerUser(
            String firstName,
            String lastName,
            String email
    ) {
        User user = User.registerCustomer(
                firstName,
                lastName,
                normalizeEmail(email),
                passwordEncoder.encode(demoPassword)
        );
        user.verifyEmail(Instant.now());

        return userRepository.saveAndFlush(user);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
