package com.nocountry.qualitytrack.deliveries.service;

import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.deliveries.dto.request.CompleteDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.dto.request.CreateDeliveryRequest;
import com.nocountry.qualitytrack.deliveries.entity.Delivery;
import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;
import com.nocountry.qualitytrack.deliveries.repository.DeliveryRepository;
import com.nocountry.qualitytrack.documents.entity.Document;
import com.nocountry.qualitytrack.documents.entity.DocumentVersion;
import com.nocountry.qualitytrack.documents.repository.DocumentVersionRepository;
import com.nocountry.qualitytrack.documents.service.DocumentAccessService;
import com.nocountry.qualitytrack.documents.service.DocumentService;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.CustomerRequest;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;
import com.nocountry.qualitytrack.traceability.service.TraceabilityService;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import com.nocountry.qualitytrack.workorders.repository.WorkOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock private DeliveryAccessPolicy accessPolicy;
    @Mock private DeliveryRepository deliveryRepository;
    @Mock private WorkOrderRepository workOrderRepository;
    @Mock private JobCaseRepository jobCaseRepository;
    @Mock private DocumentVersionRepository documentVersionRepository;
    @Mock private DocumentAccessService documentAccessService;
    @Mock private DocumentService documentService;
    @Mock private TraceabilityService traceabilityService;
    @Mock private JobCase jobCase;
    @Mock private CustomerRequest customerRequest;
    @Mock private Customer customer;
    @Mock private Quotation quotation;
    @Mock private User logistics;
    @Mock private User customerUser;

    private DeliveryService service;
    private WorkOrder workOrder;

    @BeforeEach
    void setUp() {
        service = new DeliveryService(
                accessPolicy,
                deliveryRepository,
                workOrderRepository,
                jobCaseRepository,
                documentVersionRepository,
                documentAccessService,
                documentService,
                traceabilityService
        );

        lenient().when(logistics.getId()).thenReturn(10L);
        lenient().when(customerUser.getId()).thenReturn(20L);
        lenient().when(jobCase.getCustomerRequest()).thenReturn(customerRequest);
        lenient().when(jobCase.getId()).thenReturn(50L);
        lenient().when(jobCase.getCaseNumber()).thenReturn("CASE-DELIVERY-001");
        lenient().when(jobCase.getStatus()).thenReturn(JobCaseStatus.IN_PRODUCTION);
        lenient().when(customerRequest.getId()).thenReturn(30L);
        lenient().when(customerRequest.getCustomer()).thenReturn(customer);
        lenient().when(customer.getId()).thenReturn(40L);

        workOrder = readyForDeliveryOrder(20);
        ReflectionTestUtils.setField(workOrder, "id", 7L);
    }

    @Test
    void listsDeliveriesForInternalReaders() {
        Delivery delivery = Delivery.create(
                workOrder,
                5,
                "Planta principal",
                "Cliente SA",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                null,
                "PAQUETERIA",
                logistics
        );
        ReflectionTestUtils.setField(delivery, "id", 99L);
        when(deliveryRepository.findAllByOrderByCreatedAtDescIdDesc())
                .thenReturn(List.of(delivery));

        var response = service.listAll(10L);

        assertEquals(1, response.size());
        assertEquals(99L, response.get(0).id());
        assertEquals(DeliveryStatus.PENDING, response.get(0).status());
        verify(accessPolicy).requireInternalReader(10L);
    }

    @Test
    void createsPartialDeliveryWhileReservedQuantityFitsPlan() {
        when(accessPolicy.requireLogisticsActor(10L)).thenReturn(logistics);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(deliveryRepository.sumCommittedQuantityByWorkOrderId(7L, DeliveryStatus.CANCELLED))
                .thenReturn(8L);
        when(deliveryRepository.saveAndFlush(any(Delivery.class)))
                .thenAnswer(invocation -> {
                    Delivery delivery = invocation.getArgument(0);
                    ReflectionTestUtils.setField(delivery, "id", 100L);
                    return delivery;
                });

        var response = service.create(10L, 7L, createRequest(12));

        assertEquals(12, response.quantity());
        assertEquals(DeliveryStatus.PENDING, response.status());
        assertEquals(WorkOrderStatus.READY_FOR_DELIVERY, workOrder.getStatus());
        verify(traceabilityService).record(
                any(), any(), any(), any(), any(), any(), any(), any()
        );
    }

    @Test
    void rejectsDeliveryWhenActiveReservationsWouldExceedPlan() {
        when(accessPolicy.requireLogisticsActor(10L)).thenReturn(logistics);
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(deliveryRepository.sumCommittedQuantityByWorkOrderId(7L, DeliveryStatus.CANCELLED))
                .thenReturn(15L);

        assertThrows(
                BusinessException.class,
                () -> service.create(10L, 7L, createRequest(6))
        );
    }

    @Test
    void partialLogisticsDeliveryKeepsWorkOrderReadyForDelivery() {
        Delivery delivery = dispatchedDelivery(8);
        stubLockedDelivery(delivery);
        when(accessPolicy.requireLogisticsActor(10L)).thenReturn(logistics);
        when(deliveryRepository.saveAndFlush(delivery)).thenReturn(delivery);
        when(deliveryRepository.sumDeliveredQuantityByWorkOrderId(7L, DeliveryStatus.DELIVERED))
                .thenReturn(8L);

        var response = service.deliver(
                10L,
                100L,
                new CompleteDeliveryRequest("Ana López", Instant.parse("2026-09-28T20:00:00Z"), null)
        );

        assertEquals(DeliveryStatus.DELIVERED, response.status());
        assertEquals(WorkOrderStatus.READY_FOR_DELIVERY, workOrder.getStatus());
    }

    @Test
    void customerOnlySeesDispatchedOrHistoricalShipments() {
        when(accessPolicy.requireCustomerReader(20L, 40L)).thenReturn(customerUser);
        when(jobCaseRepository.findByCustomerRequest_IdAndCustomerRequest_Customer_Id(30L, 40L))
                .thenReturn(Optional.of(jobCase));

        Delivery pending = Delivery.create(
                workOrder,
                2,
                "Planta principal",
                "Cliente SA",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                null,
                "PAQUETERIA",
                logistics
        );

        Delivery cancelledBeforeDispatch = Delivery.create(
                workOrder,
                2,
                "Planta principal",
                "Cliente SA",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                null,
                "PAQUETERIA",
                logistics
        );
        cancelledBeforeDispatch.cancel(
                logistics,
                "Preparación anulada",
                Instant.parse("2026-09-28T17:00:00Z")
        );

        Delivery dispatched = dispatchedDelivery(4);
        Document evidenceDocument = Document.create(
                jobCase,
                "DELIVERY_EVIDENCE",
                "Acuse de entrega",
                null,
                logistics
        );
        ReflectionTestUtils.setField(evidenceDocument, "id", 70L);
        DocumentVersion evidenceVersion = DocumentVersion.upload(
                evidenceDocument,
                1,
                "acuse-firmado.pdf",
                "deliveries/acuse-firmado.pdf",
                "application/pdf",
                120L,
                "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                logistics
        );
        ReflectionTestUtils.setField(evidenceVersion, "id", 71L);
        dispatched.attachEvidence(evidenceVersion);

        when(deliveryRepository
                .findAllByWorkOrder_JobCase_CustomerRequest_IdAndWorkOrder_JobCase_CustomerRequest_Customer_IdOrderByCreatedAtAscIdAsc(
                        30L,
                        40L
                ))
                .thenReturn(List.of(pending, cancelledBeforeDispatch, dispatched));

        var response = service.listForCustomerRequest(20L, 40L, 30L);

        assertEquals(1, response.size());
        assertEquals(DeliveryStatus.DISPATCHED, response.get(0).status());
        assertEquals(70L, response.get(0).evidenceDocumentId());
        assertEquals(71L, response.get(0).evidenceDocumentVersionId());
        assertEquals("acuse-firmado.pdf", response.get(0).evidenceFileName());
    }

    @Test
    void rejectsUnknownEvidenceWhenLogisticsCompletesDelivery() {
        Delivery delivery = dispatchedDelivery(8);
        stubLockedDelivery(delivery);
        when(accessPolicy.requireLogisticsActor(10L)).thenReturn(logistics);
        when(documentVersionRepository.findByIdAndDocument_JobCase_IdAndDocument_Status(
                999L,
                jobCase.getId(),
                com.nocountry.qualitytrack.documents.enums.DocumentStatus.ACTIVE
        )).thenReturn(Optional.empty());

        assertThrows(
                BusinessException.class,
                () -> service.deliver(
                        10L,
                        100L,
                        new CompleteDeliveryRequest("Ana López", Instant.parse("2026-09-28T20:00:00Z"), 999L)
                )
        );
    }

    @Test
    void finalLogisticsDeliveryClosesWorkOrderAndJobCase() {
        Delivery delivery = dispatchedDelivery(12);
        stubLockedDelivery(delivery);
        when(accessPolicy.requireLogisticsActor(10L)).thenReturn(logistics);
        when(deliveryRepository.saveAndFlush(delivery)).thenReturn(delivery);
        when(deliveryRepository.sumDeliveredQuantityByWorkOrderId(7L, DeliveryStatus.DELIVERED))
                .thenReturn(20L);
        when(deliveryRepository.findLatestDeliveredAtByWorkOrderId(
                7L,
                DeliveryStatus.DELIVERED
        )).thenReturn(Optional.of(Instant.parse("2026-09-28T20:00:00Z")));

        service.deliver(
                10L,
                100L,
                new CompleteDeliveryRequest("Ana López", Instant.parse("2026-09-28T20:00:00Z"), null)
        );

        assertEquals(WorkOrderStatus.DELIVERED, workOrder.getStatus());
        verify(workOrderRepository).saveAndFlush(workOrder);
        verify(jobCase).complete(Instant.parse("2026-09-28T20:00:00Z"));
        verify(jobCaseRepository).saveAndFlush(jobCase);
        verify(traceabilityService).record(
                eq(jobCase),
                eq(com.nocountry.qualitytrack.traceability.enums.TraceabilityAggregateType.JOB_CASE),
                eq(50L),
                eq(TraceabilityEventType.JOB_CASE_COMPLETED),
                eq(JobCaseStatus.IN_PRODUCTION.name()),
                eq(JobCaseStatus.COMPLETED.name()),
                eq(10L),
                any()
        );
    }

    private void stubLockedDelivery(Delivery delivery) {
        when(deliveryRepository.findWorkOrderIdById(100L)).thenReturn(Optional.of(7L));
        when(workOrderRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(workOrder));
        when(deliveryRepository.findByIdForUpdate(100L)).thenReturn(Optional.of(delivery));
    }

    private Delivery dispatchedDelivery(int quantity) {
        Delivery delivery = Delivery.create(
                workOrder,
                quantity,
                "Planta principal",
                "Cliente SA",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                null,
                "PAQUETERIA",
                logistics
        );
        ReflectionTestUtils.setField(delivery, "id", 100L);
        delivery.dispatch(
                logistics,
                "Transportes Demo",
                "GUIA-123",
                Instant.parse("2026-09-28T18:00:00Z")
        );
        return delivery;
    }

    private CreateDeliveryRequest createRequest(int quantity) {
        return new CreateDeliveryRequest(
                quantity,
                "Planta principal",
                "Cliente SA",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                "Acceso por almacén",
                "PAQUETERIA"
        );
    }

    private WorkOrder readyForDeliveryOrder(int quantity) {
        WorkOrder order = WorkOrder.create(
                jobCase,
                quotation,
                "OT-DELIVERY-001",
                WorkOrderPriority.NORMAL,
                quantity,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                logistics
        );
        order.releaseToProduction();
        order.startProduction(Instant.parse("2026-09-28T08:00:00Z"));
        order.markProductionCompleted(Instant.parse("2026-09-28T16:00:00Z"));
        order.sendToQuality();
        order.approveQuality();
        return order;
    }
}
