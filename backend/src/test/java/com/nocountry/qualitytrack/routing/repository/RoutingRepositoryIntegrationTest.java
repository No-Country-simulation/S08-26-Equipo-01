package com.nocountry.qualitytrack.routing.repository;

import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.routing.enums.RoutingPurpose;
import com.nocountry.qualitytrack.routing.enums.RoutingSheetStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@Testcontainers
@SpringBootTest(properties = {
        "security.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
        "app.email.resend.api-key=test-api-key",
        "app.email.resend.from=test@qualitytrack.local",
        "app.documents.storage-provider=local",
        "app.documents.storage-root=./target/test-storage/documents"
})
@Transactional
class RoutingRepositoryIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRESQL = new PostgreSQLContainer(
            DockerImageName.parse("postgres:16-alpine")
    );

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private RoutingSheetRepository routingSheetRepository;

    @Test
    void repositoryMapsRoutingAndOperations() {
        Fixture fixture = createFixture("mapping");
        Long routingId = insertRouting(fixture, 1, "PRODUCTION", "DRAFT");
        insertOperation(routingId, 10, "CUT", 30);
        insertOperation(routingId, 20, "TURN-CNC", 180);

        RoutingSheet routingSheet = routingSheetRepository.findById(routingId).orElseThrow();

        assertEquals(1, routingSheet.getRevision());
        assertEquals(RoutingPurpose.PRODUCTION, routingSheet.getPurpose());
        assertEquals(RoutingSheetStatus.DRAFT, routingSheet.getStatus());
        assertEquals(2, routingSheet.getOperations().size());
        assertEquals(210, routingSheet.totalEstimatedMinutes());
    }

    @Test
    void databaseRejectsDuplicateRevisionForSameWorkOrder() {
        Fixture fixture = createFixture("revision");
        insertRouting(fixture, 1, "PRODUCTION", "DRAFT");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertRouting(fixture, 1, "REWORK", "DRAFT")
        );
    }

    @Test
    void databaseRejectsSecondProductionRouting() {
        Fixture fixture = createFixture("production");
        insertRouting(fixture, 1, "PRODUCTION", "DRAFT");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertRouting(fixture, 2, "PRODUCTION", "DRAFT")
        );
    }

    @Test
    void databaseRejectsDuplicateOperationSequenceWhenDeferredConstraintIsChecked() {
        Fixture fixture = createFixture("sequence");
        Long routingId = insertRouting(fixture, 1, "PRODUCTION", "DRAFT");
        insertOperation(routingId, 10, "CUT", 30);
        insertOperation(routingId, 10, "TURN", 45);

        assertThrows(
                DataIntegrityViolationException.class,
                () -> jdbcTemplate.execute(
                        "SET CONSTRAINTS uq_routing_operations_sheet_sequence IMMEDIATE"
                )
        );
    }

    @Test
    void databaseRejectsApprovedRoutingWithoutApprovalAudit() {
        Fixture fixture = createFixture("audit");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertRouting(fixture, 1, "PRODUCTION", "APPROVED")
        );
    }

    @Test
    void databaseRejectsNonPositiveEstimatedMinutes() {
        Fixture fixture = createFixture("minutes");
        Long routingId = insertRouting(fixture, 1, "PRODUCTION", "DRAFT");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertOperation(routingId, 10, "CUT", 0)
        );
    }

    private Fixture createFixture(String suffix) {
        Long internalUserId = jdbcTemplate.queryForObject(
                """
                INSERT INTO users (
                    first_name,
                    last_name,
                    email,
                    password_hash,
                    account_type,
                    status
                )
                VALUES (?, ?, ?, ?, 'INTERNAL', 'ACTIVE')
                RETURNING id
                """,
                Long.class,
                "Elena",
                "Ingeniería",
                "engineering-routing-" + suffix + "@qualitytrack.test",
                "test-hash"
        );

        Long customerUserId = jdbcTemplate.queryForObject(
                """
                INSERT INTO users (
                    first_name,
                    last_name,
                    email,
                    password_hash,
                    account_type,
                    status
                )
                VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')
                RETURNING id
                """,
                Long.class,
                "Ana",
                "Cliente",
                "customer-routing-" + suffix + "@qualitytrack.test",
                "test-hash"
        );

        Long customerId = jdbcTemplate.queryForObject(
                """
                INSERT INTO customers (
                    name,
                    created_by_user_id
                )
                VALUES (?, ?)
                RETURNING id
                """,
                Long.class,
                "Industrias Routing " + suffix,
                internalUserId
        );

        Long requestId = jdbcTemplate.queryForObject(
                """
                INSERT INTO customer_requests (
                    customer_id,
                    request_number,
                    title,
                    description,
                    quantity,
                    material_requirement_type,
                    material_requirement,
                    requested_by_user_id
                )
                VALUES (?, ?, ?, ?, 20, 'SPECIFIED', 'AISI 304', ?)
                RETURNING id
                """,
                Long.class,
                customerId,
                "REQ-RT-" + suffix,
                "Eje " + suffix,
                "Fabricar según plano.",
                customerUserId
        );

        Long caseId = jdbcTemplate.queryForObject(
                """
                INSERT INTO job_cases (
                    request_id,
                    case_number,
                    status,
                    assigned_to_user_id,
                    assigned_at,
                    opened_at
                )
                VALUES (?, ?, 'IN_PRODUCTION', ?, NOW(), NOW())
                RETURNING id
                """,
                Long.class,
                requestId,
                "CASE-RT-" + suffix,
                internalUserId
        );

        Long quotationId = jdbcTemplate.queryForObject(
                """
                INSERT INTO quotations (
                    case_id,
                    quotation_number,
                    revision,
                    status,
                    currency,
                    subtotal,
                    tax_rate,
                    tax,
                    total,
                    valid_until,
                    estimated_delivery_date,
                    sent_at,
                    approved_at,
                    created_by_user_id
                )
                VALUES (
                    ?, ?, 1, 'APPROVED', 'MXN',
                    100.00, 16.0000, 16.00, 116.00,
                    CURRENT_DATE + 10,
                    DATE '2026-10-20',
                    NOW(),
                    NOW(),
                    ?
                )
                RETURNING id
                """,
                Long.class,
                caseId,
                "QT-RT-" + suffix,
                internalUserId
        );

        Long workOrderId = jdbcTemplate.queryForObject(
                """
                INSERT INTO work_orders (
                    case_id,
                    approved_quotation_id,
                    work_order_number,
                    status,
                    priority,
                    planned_quantity,
                    planned_start_date,
                    planned_end_date,
                    agreed_delivery_date,
                    created_by_user_id
                )
                VALUES (?, ?, ?, 'CREATED', 'NORMAL', 20, ?, ?, ?, ?)
                RETURNING id
                """,
                Long.class,
                caseId,
                quotationId,
                "OT-RT-" + suffix,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                internalUserId
        );

        return new Fixture(internalUserId, workOrderId);
    }

    private Long insertRouting(
            Fixture fixture,
            int revision,
            String purpose,
            String status
    ) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO routing_sheets (
                    work_order_id,
                    revision,
                    purpose,
                    status,
                    created_by_user_id
                )
                VALUES (?, ?, ?, ?, ?)
                RETURNING id
                """,
                Long.class,
                fixture.workOrderId(),
                revision,
                purpose,
                status,
                fixture.internalUserId()
        );
    }

    private void insertOperation(
            Long routingSheetId,
            int sequence,
            String code,
            int estimatedMinutes
    ) {
        jdbcTemplate.update(
                """
                INSERT INTO routing_operations (
                    routing_sheet_id,
                    sequence_number,
                    code,
                    name,
                    estimated_minutes
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                routingSheetId,
                sequence,
                code,
                code + " operation",
                estimatedMinutes
        );
    }

    private record Fixture(
            Long internalUserId,
            Long workOrderId
    ) {
    }
}
