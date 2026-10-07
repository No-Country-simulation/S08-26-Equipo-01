package com.nocountry.qualitytrack.documents.repository;

import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.enums.DocumentStatus;
import com.nocountry.qualitytrack.materials.repository.MaterialLotRepository;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderDocumentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Testcontainers
@SpringBootTest(properties = {
        "security.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
        "app.email.resend.api-key=test-api-key",
        "app.email.resend.from=test@qualitytrack.local",
        "app.documents.storage-provider=local",
        "app.documents.storage-root=./target/test-storage/documents"
})
@Transactional
class DocumentCenterRepositoryIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRESQL = new PostgreSQLContainer(
            DockerImageName.parse("postgres:16-alpine")
    );

    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private DocumentRepository documentRepository;
    @Autowired private WorkOrderDocumentRepository workOrderDocumentRepository;
    @Autowired private MaterialLotRepository materialLotRepository;
    @Autowired private DeliveryRepository deliveryRepository;

    @Test
    void workOrderSearchIncludesPinnedMaterialAndDeliveryDocumentsWithExactVersions() {
        Fixture fixture = createFixture("center");

        DocumentFixture drawing = createDocument(
                fixture,
                "DRAWING",
                "Plano de fabricación",
                "drawing"
        );
        Long drawingV2 = addVersion(
                drawing.documentId(),
                fixture.internalUserId(),
                2,
                "drawing-v2"
        );
        insertPinnedDocument(
                fixture.workOrderId(),
                fixture.caseId(),
                drawing.documentId(),
                drawing.versionId(),
                fixture.internalUserId()
        );

        Long materialId = insertMaterial("MAT-CENTER");
        Long materialLotId = insertMaterialLot(
                materialId,
                null
        );
        DocumentFixture certificate = createMaterialLotDocument(
                materialLotId,
                fixture.internalUserId(),
                "MATERIAL_CERTIFICATE",
                "Certificado de material",
                "certificate"
        );
        attachCertificateVersion(materialLotId, certificate.versionId());
        insertConsumption(
                fixture.workOrderId(),
                materialLotId,
                fixture.internalUserId()
        );

        DocumentFixture evidence = createDocument(
                fixture,
                "DELIVERY_EVIDENCE",
                "Acuse de entrega",
                "delivery"
        );
        Long deliveryId = insertDelivery(
                fixture.workOrderId(),
                evidence.versionId(),
                fixture.internalUserId()
        );

        List<Document> documents = documentRepository.searchActiveForCenter(
                DocumentStatus.ACTIVE,
                null,
                null,
                null,
                fixture.workOrderId(),
                null,
                null
        );

        assertEquals(3, documents.size());
        assertTrue(documents.stream().anyMatch(document ->
                document.getId().equals(drawing.documentId())));
        assertTrue(documents.stream().anyMatch(document ->
                document.getId().equals(certificate.documentId())));
        assertTrue(documents.stream().anyMatch(document ->
                document.getId().equals(evidence.documentId())));

        var workOrderReferences = workOrderDocumentRepository
                .findAllByDocument_IdOrderByWorkOrder_IdAsc(drawing.documentId());
        assertEquals(1, workOrderReferences.size());
        assertEquals(drawing.versionId(), workOrderReferences.get(0).getDocumentVersion().getId());
        assertEquals(1, workOrderReferences.get(0).getDocumentVersion().getVersion());
        assertTrue(!drawingV2.equals(workOrderReferences.get(0).getDocumentVersion().getId()));

        var materialReferences = materialLotRepository
                .findAllByCertificateDocumentVersion_Document_IdOrderByIdAsc(
                        certificate.documentId()
                );
        assertEquals(1, materialReferences.size());
        assertEquals(materialLotId, materialReferences.get(0).getId());
        assertEquals(
                certificate.versionId(),
                materialReferences.get(0).getCertificateDocumentVersion().getId()
        );
        assertEquals(materialLotId, documents.stream()
                .filter(document -> document.getId().equals(certificate.documentId()))
                .findFirst()
                .orElseThrow()
                .getMaterialLot()
                .getId());

        var deliveryReferences = deliveryRepository
                .findAllByEvidenceDocumentVersion_Document_IdOrderByIdAsc(
                        evidence.documentId()
                );
        assertEquals(1, deliveryReferences.size());
        assertEquals(deliveryId, deliveryReferences.get(0).getId());
        assertEquals(
                evidence.versionId(),
                deliveryReferences.get(0).getEvidenceDocumentVersion().getId()
        );
    }

    @Test
    void legacyCaseOwnedCertificateRemainsSearchableThroughConsumedLot() {
        Fixture source = createFixture("source-case");
        Fixture consumer = createFixture("consumer-case");

        DocumentFixture certificate = createDocument(
                source,
                "MATERIAL_CERTIFICATE",
                "Certificado compartido",
                "shared-certificate"
        );
        Long materialId = insertMaterial("MAT-SHARED");
        Long materialLotId = insertMaterialLot(
                materialId,
                certificate.versionId()
        );
        insertConsumption(
                consumer.workOrderId(),
                materialLotId,
                consumer.internalUserId()
        );

        List<Document> documents = documentRepository.searchActiveForCenter(
                DocumentStatus.ACTIVE,
                null,
                null,
                null,
                consumer.workOrderId(),
                null,
                null
        );

        assertEquals(1, documents.size());
        assertEquals(certificate.documentId(), documents.get(0).getId());
        assertEquals(source.caseId(), documents.get(0).getJobCase().getId());
        assertTrue(!consumer.caseId().equals(documents.get(0).getJobCase().getId()));
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
                VALUES ('Patricia', 'Documentos', ?, 'test-hash', 'INTERNAL', 'ACTIVE')
                RETURNING id
                """,
                Long.class,
                "documents-" + suffix + "@qualitytrack.test"
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
                "documents-customer-" + suffix + "@qualitytrack.test"
        );

        Long customerId = jdbcTemplate.queryForObject(
                """
                INSERT INTO customers (name, created_by_user_id)
                VALUES (?, ?)
                RETURNING id
                """,
                Long.class,
                "Industrias Documentos " + suffix,
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
                VALUES (?, ?, ?, 'Fabricar conforme a plano.', 20, 'SPECIFIED', 'AISI 304', ?)
                RETURNING id
                """,
                Long.class,
                customerId,
                "REQ-DOC-" + suffix,
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
                "CASE-DOC-" + suffix,
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
                "QT-DOC-" + suffix,
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
                "OT-DOC-" + suffix,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                internalUserId
        );

        return new Fixture(internalUserId, caseId, workOrderId);
    }

    private DocumentFixture createDocument(
            Fixture fixture,
            String documentType,
            String name,
            String suffix
    ) {
        Long documentId = jdbcTemplate.queryForObject(
                """
                INSERT INTO documents (
                    case_id,
                    document_type,
                    name,
                    created_by_user_id
                )
                VALUES (?, ?, ?, ?)
                RETURNING id
                """,
                Long.class,
                fixture.caseId(),
                documentType,
                name,
                fixture.internalUserId()
        );

        Long versionId = addVersion(
                documentId,
                fixture.internalUserId(),
                1,
                suffix + "-v1"
        );

        return new DocumentFixture(documentId, versionId);
    }

    private DocumentFixture createMaterialLotDocument(
            Long materialLotId,
            Long userId,
            String documentType,
            String name,
            String suffix
    ) {
        Long documentId = jdbcTemplate.queryForObject(
                """
                INSERT INTO documents (
                    material_lot_id,
                    document_type,
                    name,
                    created_by_user_id
                )
                VALUES (?, ?, ?, ?)
                RETURNING id
                """,
                Long.class,
                materialLotId,
                documentType,
                name,
                userId
        );

        Long versionId = addVersion(
                documentId,
                userId,
                1,
                suffix + "-v1"
        );

        return new DocumentFixture(documentId, versionId);
    }

    private void attachCertificateVersion(
            Long materialLotId,
            Long certificateVersionId
    ) {
        jdbcTemplate.update(
                """
                UPDATE material_lots
                SET certificate_document_version_id = ?
                WHERE id = ?
                """,
                certificateVersionId,
                materialLotId
        );
    }

    private Long addVersion(
            Long documentId,
            Long userId,
            int version,
            String suffix
    ) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO document_versions (
                    document_id,
                    version,
                    file_name,
                    storage_key,
                    mime_type,
                    file_size,
                    checksum,
                    uploaded_by_user_id
                )
                VALUES (?, ?, ?, ?, 'application/pdf', 128, ?, ?)
                RETURNING id
                """,
                Long.class,
                documentId,
                version,
                suffix + ".pdf",
                "document-center-tests/" + suffix + "-" + documentId,
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                userId
        );
    }

    private void insertPinnedDocument(
            Long workOrderId,
            Long caseId,
            Long documentId,
            Long versionId,
            Long userId
    ) {
        jdbcTemplate.update(
                """
                INSERT INTO work_order_documents (
                    work_order_id,
                    case_id,
                    document_id,
                    document_version_id,
                    linked_by_user_id
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                workOrderId,
                caseId,
                documentId,
                versionId,
                userId
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

    private Long insertMaterialLot(
            Long materialId,
            Long certificateVersionId
    ) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO material_lots (
                    material_id,
                    lot_number,
                    received_at,
                    quantity_received,
                    certificate_document_version_id
                )
                VALUES (?, 'LOT-CENTER-001', NOW(), 100.000, ?)
                RETURNING id
                """,
                Long.class,
                materialId,
                certificateVersionId
        );
    }

    private void insertConsumption(
            Long workOrderId,
            Long materialLotId,
            Long userId
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
                userId
        );
    }

    private Long insertDelivery(
            Long workOrderId,
            Long evidenceVersionId,
            Long userId
    ) {
        return jdbcTemplate.queryForObject(
                """
                INSERT INTO deliveries (
                    work_order_id,
                    quantity,
                    status,
                    destination_recipient_name,
                    destination_address,
                    destination_city,
                    destination_state,
                    destination_postal_code,
                    destination_country,
                    delivery_method,
                    evidence_document_version_id,
                    created_by_user_id
                )
                VALUES (
                    ?, 20, 'PENDING',
                    'Cliente Demo',
                    'Av. México 123',
                    'Tepic',
                    'Nayarit',
                    '63000',
                    'México',
                    'PAQUETERIA',
                    ?,
                    ?
                )
                RETURNING id
                """,
                Long.class,
                workOrderId,
                evidenceVersionId,
                userId
        );
    }

    private record Fixture(
            Long internalUserId,
            Long caseId,
            Long workOrderId
    ) {
    }

    private record DocumentFixture(
            Long documentId,
            Long versionId
    ) {
    }
}
