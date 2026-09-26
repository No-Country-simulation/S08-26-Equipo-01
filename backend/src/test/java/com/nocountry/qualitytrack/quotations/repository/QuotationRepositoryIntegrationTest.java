package com.nocountry.qualitytrack.quotations.repository;

import com.nocountry.qualitytrack.quotations.entity.Quotation;
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

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

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
class QuotationRepositoryIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRESQL = new PostgreSQLContainer(
            DockerImageName.parse("postgres:16-alpine")
    );

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private QuotationRepository quotationRepository;

    @Test
    void customerVisibilityReturnsLastSentRevisionWhileNewDraftStaysInternal() {
        Fixture fixture = createFixture("visibility");

        insertQuotation(
                fixture.caseId(),
                fixture.internalUserId(),
                "QT-VISIBILITY",
                1,
                "SUPERSEDED",
                Instant.now(),
                null
        );
        insertQuotation(
                fixture.caseId(),
                fixture.internalUserId(),
                "QT-VISIBILITY",
                2,
                "DRAFT",
                null,
                null
        );

        List<Quotation> visible = quotationRepository
                .findLatestVisibleRevisionsForCustomer(fixture.customerId());

        assertEquals(1, visible.size());
        assertEquals(1, visible.get(0).getRevision());
        assertEquals("SUPERSEDED", visible.get(0).getStatus().name());
    }

    @Test
    void databasePreventsTwoActiveRevisionsForSameCase() {
        Fixture fixture = createFixture("active");

        insertQuotation(
                fixture.caseId(),
                fixture.internalUserId(),
                "QT-ACTIVE",
                1,
                "SENT",
                Instant.now(),
                null
        );

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertQuotation(
                        fixture.caseId(),
                        fixture.internalUserId(),
                        "QT-ACTIVE",
                        2,
                        "DRAFT",
                        null,
                        null
                )
        );
    }

    @Test
    void rejectedQuotationRequiresRejectedTimestamp() {
        Fixture fixture = createFixture("rejected");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertQuotation(
                        fixture.caseId(),
                        fixture.internalUserId(),
                        "QT-REJECTED",
                        1,
                        "REJECTED",
                        Instant.now(),
                        null
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
                VALUES (?, ?, ?, ?, 'INTERNAL', 'ACTIVE')
                RETURNING id
                """,
                Long.class,
                "Carlos",
                "Ruiz",
                "commercial-" + suffix + "@qualitytrack.test",
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
                "customer-" + suffix + "@qualitytrack.test",
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
                "Industrias " + suffix,
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
                VALUES (?, ?, ?, ?, 10, 'SPECIFIED', 'AISI 4140', ?)
                RETURNING id
                """,
                Long.class,
                customerId,
                "REQ-" + suffix,
                "Pieza " + suffix,
                "Fabricar conforme a plano.",
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
                VALUES (?, ?, 'READY_FOR_QUOTATION', ?, NOW(), NOW())
                RETURNING id
                """,
                Long.class,
                requestId,
                "CASE-" + suffix,
                internalUserId
        );

        return new Fixture(internalUserId, customerId, caseId);
    }

    private Long insertQuotation(
            Long caseId,
            Long internalUserId,
            String quotationNumber,
            int revision,
            String status,
            Instant sentAt,
            Instant rejectedAt
    ) {
        return jdbcTemplate.queryForObject(
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
                    rejected_at,
                    created_by_user_id
                )
                VALUES (
                    ?, ?, ?, ?, 'MXN',
                    100.00, 16.0000, 16.00, 116.00,
                    CURRENT_DATE + 10,
                    CURRENT_DATE + 20,
                    ?, ?,
                    ?
                )
                RETURNING id
                """,
                Long.class,
                caseId,
                quotationNumber,
                revision,
                status,
                sentAt == null ? null : Timestamp.from(sentAt),
                rejectedAt == null ? null : Timestamp.from(rejectedAt),
                internalUserId
        );
    }

    private record Fixture(
            Long internalUserId,
            Long customerId,
            Long caseId
    ) {
    }
}
