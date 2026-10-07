package com.nocountry.qualitytrack.devseed;

import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Profile("seed-demo")
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder {

    private static final String SEED_MARKER_EMAIL =
            "auditor.demo@qualitytrack.test";

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final JobCaseRepository jobCaseRepository;
    private final QuotationRepository quotationRepository;
    private final WorkOrderRepository workOrderRepository;

    private final DemoIdentitySeeder identitySeeder;
    private final DemoCommercialSeeder commercialSeeder;
    private final DemoOperationsSeeder operationsSeeder;

    @Value("${app.demo-seed.admin-email}")
    private String adminEmail;

    @EventListener(ApplicationReadyEvent.class)
    @Order(Ordered.LOWEST_PRECEDENCE)
    public void seedAfterStartup() {
        if (userRepository.existsByEmail(SEED_MARKER_EMAIL)) {
            log.info("Demo seed already present. Skipping.");
            return;
        }

        User admin = userRepository.findByEmailIgnoreCase(adminEmail)
                .orElseThrow(() -> new IllegalStateException(
                        "seed-demo requires the bootstrap admin to exist first: "
                                + adminEmail
                ));

        requireCleanDatabase();

        log.info("Creating deterministic QualityTrack demo data...");

        DemoInternalActors actors =
                identitySeeder.createInternalActors(admin);

        DemoCustomer maquinados = identitySeeder.createCustomer(
                "María",
                "López",
                "maria.lopez@maquinados.test",
                "Maquinados del Pacífico",
                "MDP260101AA1",
                "311-100-1100",
                "administracion@maquinados.test",
                "Tepic",
                "Nayarit",
                "https://maquinados.example"
        );
        identitySeeder.addCustomerRequester(
                maquinados,
                "Daniel",
                "Ramos",
                "compras@maquinados.test"
        );

        DemoCustomer motores = identitySeeder.createCustomer(
                "Juan",
                "Mendoza",
                "juan.mendoza@motores.test",
                "Motores del Norte",
                "MDN260101BB2",
                "614-200-2200",
                "compras@motores.test",
                "Chihuahua",
                "Chihuahua",
                "https://motores.example"
        );

        DemoCustomer atlas = identitySeeder.createCustomer(
                "Laura",
                "García",
                "laura.garcia@atlas.test",
                "Grupo Atlas Industrial",
                "GAI260101CC3",
                "33-3000-3300",
                "operaciones@atlas.test",
                "Guadalajara",
                "Jalisco",
                "https://atlas.example"
        );

        DemoCustomer hidraulica = identitySeeder.createCustomer(
                "Roberto",
                "Silva",
                "roberto.silva@hidraulica.test",
                "Hidráulica MX",
                "HMX260101DD4",
                "81-4000-4400",
                "contacto@hidraulica.test",
                "Monterrey",
                "Nuevo León",
                "https://hidraulica.example"
        );

        commercialSeeder.seedReviewScenarios(
                actors,
                maquinados
        );
        commercialSeeder.seedQuotationScenarios(
                actors,
                maquinados,
                motores
        );
        operationsSeeder.seedWorkOrderScenarios(
                actors,
                motores,
                atlas
        );
        operationsSeeder.seedQualityAndDeliveryScenarios(
                actors,
                atlas,
                hidraulica
        );

        identitySeeder.createCompletionMarker(
                admin,
                SEED_MARKER_EMAIL
        );

        log.info("QualityTrack demo seed completed.");
        log.info(
                "Demo accounts use the password configured in DEMO_SEED_PASSWORD."
        );
    }

    private void requireCleanDatabase() {
        boolean hasDomainData =
                customerRepository.count() > 0
                        || jobCaseRepository.count() > 0
                        || quotationRepository.count() > 0
                        || workOrderRepository.count() > 0;

        if (hasDomainData || userRepository.count() > 1) {
            throw new IllegalStateException(
                    "seed-demo only runs on a clean database containing only "
                            + "the bootstrap admin. Run "
                            + "scripts/dev/reset-and-seed.ps1 first."
            );
        }
    }
}
