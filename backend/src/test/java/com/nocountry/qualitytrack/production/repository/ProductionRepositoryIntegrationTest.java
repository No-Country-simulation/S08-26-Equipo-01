package com.nocountry.qualitytrack.production.repository;

import com.nocountry.qualitytrack.production.entity.OperationExecution;
import com.nocountry.qualitytrack.production.enums.OperationExecutionStatus;
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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

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
class ProductionRepositoryIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRESQL = new PostgreSQLContainer(
            DockerImageName.parse("postgres:16-alpine")
    );

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private OperationExecutionRepository executionRepository;

    @Test
    void repositoryMapsCompletedExecution() {
        Fixture fixture = createFixture("mapping");

        Long executionId = insertCompletedExecution(
                fixture,
                1,
                20,
                19,
                1
        );

        OperationExecution execution = executionRepository
                .findById(executionId)
                .orElseThrow();

        assertEquals(OperationExecutionStatus.COMPLETED, execution.getStatus());
        assertEquals(1, execution.getAttemptNumber());
        assertEquals(20, execution.getQuantityProcessed());
        assertEquals(19, execution.getQuantityAccepted());
        assertEquals(1, execution.getQuantityRejected());
    }

    @Test
    void databaseRejectsInconsistentExecutionQuantities() {
        Fixture fixture = createFixture("quantities");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertCompletedExecution(
                        fixture,
                        1,
                        20,
                        18,
                        1
                )
        );
    }

    @Test
    void databaseRejectsDuplicateAttemptForOperation() {
        Fixture fixture = createFixture("attempt");
        insertCompletedExecution(fixture, 1, 20, 20, 0);

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertCompletedExecution(
                        fixture,
                        1,
                        20,
                        20,
                        0
                )
        );
    }

    @Test
    void databaseRejectsInvalidMachineStatus() {
        assertThrows(
                DataIntegrityViolationException.class,
                () -> jdbcTemplate.update(
                        """
                        INSERT INTO machines (code, name, status)
                        VALUES ('BAD-01', 'Máquina inválida', 'BROKEN')
                        """
                )
        );
    }

    @Test
    void databaseRejectsActualEndBeforeActualStart() {
        Fixture fixture = createFixture("actual-dates");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> jdbcTemplate.update(
                        """
                        UPDATE work_orders
                        SET actual_start_at = ?,
                            actual_end_at = ?
                        WHERE id = ?
                        """,
                        OffsetDateTime.of(
                                2026, 9, 28, 10, 0, 0, 0, ZoneOffset.UTC
                        ),
                        OffsetDateTime.of(
                                2026, 9, 28, 9, 0, 0, 0, ZoneOffset.UTC
                        ),
                        fixture.workOrderId()
                )
        );
    }

    @Test
    void databaseRejectsDuplicateConsumptionForSameOrderAndLot() {
        Fixture fixture = createFixture("consumption");
        Long materialId = insertMaterial("MAT-CONSUMPTION");
        Long lotId = insertMaterialLot(materialId, "LOT-001");

        insertConsumption(
                fixture.workOrderId(),
                lotId,
                fixture.internalUserId()
        );

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertConsumption(
                        fixture.workOrderId(),
                        lotId,
                        fixture.internalUserId()
                )
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
                VALUES ('Patricia', 'Producción', ?, 'test-hash', 'INTERNAL', 'ACTIVE')
                RETURNING id
                """,
                Long.class,
                "production-v20-" + suffix + "@qualitytrack.test"
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
                VALUES ('Ana', 'Cliente', ?, 'test-hash', 'CUSTOMER', 'ACTIVE')
                RETURNING id
                """,
                Long.class,
                "customer-v20-" + suffix + "@qualitytrack.test"
        );

        Long customerId = jdbcTemplate.queryForObject(
                """
                INSERT INTO customers (name, created_by_user_id)
                VALUES (?, ?)
                RETURNING id
                """,
                Long.class,
                "Industrias Producción " + suffix,
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
                VALUES (?, ?, ?, 'Fabricar según plano.', 20, 'SPECIFIED', 'AISI 304', ?)
                RETURNING id
                """,
                Long.class,
                customerId,
                "REQ-PROD-" + suffix,
                "Eje " + suffix,
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
                "CASE-PROD-" + suffix,
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
                "QT-PROD-" + suffix,
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
                VALUES (?, ?, ?, 'IN_PRODUCTION', 'NORMAL', 20, ?, ?, ?, ?)
                RETURNING id
                """,
                Long.class,
                caseId,
                quotationId,
                "OT-PROD-" + suffix,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                internalUserId
        );

        Long routingSheetId = jdbcTemplate.queryForObject(
                """
                INSERT INTO routing_sheets (
                    work_order_id,
                    revision,
                    purpose,
                    status,
                    created_by_user_id,
                    approved_by_user_id,
                    approved_at,
                    released_by_user_id,
                    released_at
                )
                VALUES (?, 1, 'PRODUCTION', 'RELEASED', ?, ?, NOW(), ?, NOW())
                RETURNING id
                """,
                Long.class,
                workOrderId,
                internalUserId,
                internalUserId,
                internalUserId
        );

        Long operationId = jdbcTemplate.queryForObject(
                """
                INSERT INTO routing_operations (
                    routing_sheet_id,
                    sequence_number,
                    code,
                    name,
                    estimated_minutes
                )
                VALUES (?, 10, 'CUT', 'Corte', 30)
                RETURNING id
                """,
                Long.class,
                routingSheetId
        );

        return new Fixture(internalUserId, workOrderId, operationId);
    }

    private Long insertCompletedExecution(
            Fixture fixture,
            int attempt,
            int processed,
            int accepted,
            int rejected
    ) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO operation_executions (
                    routing_operation_id,
                    operator_id,
                    attempt_number,
                    status,
                    started_at,
                    finished_at,
                    quantity_processed,
                    quantity_accepted,
                    quantity_rejected
                )
                VALUES (?, ?, ?, 'COMPLETED', NOW() - INTERVAL '1 hour', NOW(), ?, ?, ?)
                RETURNING id
                """,
                Long.class,
                fixture.operationId(),
                fixture.internalUserId(),
                attempt,
                processed,
                accepted,
                rejected
        );
    }

    private Long insertMaterial(String code) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO materials (code, name, unit)
                VALUES (?, 'Acero inoxidable', 'KG')
                RETURNING id
                """,
                Long.class,
                code
        );
    }

    private Long insertMaterialLot(Long materialId, String lotNumber) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO material_lots (
                    material_id,
                    lot_number,
                    received_at,
                    quantity_received
                )
                VALUES (?, ?, NOW(), 100.000)
                RETURNING id
                """,
                Long.class,
                materialId,
                lotNumber
        );
    }

    private void insertConsumption(
            Long workOrderId,
            Long materialLotId,
            Long internalUserId
    ) {
        jdbcTemplate.update(
                """
                INSERT INTO work_order_materials (
                    work_order_id,
                    material_lot_id,
                    quantity_used,
                    recorded_by_user_id,
                    recorded_at
                )
                VALUES (?, ?, 10.000, ?, NOW())
                """,
                workOrderId,
                materialLotId,
                internalUserId
        );
    }

    private record Fixture(
            Long internalUserId,
            Long workOrderId,
            Long operationId
    ) {
    }
}
