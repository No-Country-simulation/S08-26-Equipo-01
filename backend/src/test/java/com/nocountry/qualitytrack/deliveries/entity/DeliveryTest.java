package com.nocountry.qualitytrack.deliveries.entity;

import com.nocountry.qualitytrack.deliveries.enums.DeliveryStatus;
import com.nocountry.qualitytrack.quotations.entity.Quotation;
import com.nocountry.qualitytrack.requests.entity.JobCase;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderPriority;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;

class DeliveryTest {

    @Test
    void dispatchAndReceptionAreSeparateStates() {
        User actor = mock(User.class);
        Delivery delivery = Delivery.create(
                readyOrder(actor),
                5,
                "Planta principal",
                "Cliente",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                null,
                "PAQUETERIA",
                actor
        );

        delivery.dispatch(
                actor,
                "Transportes Demo",
                "GUIA-123",
                Instant.parse("2026-09-28T18:00:00Z")
        );

        assertEquals(DeliveryStatus.DISPATCHED, delivery.getStatus());

        delivery.markDelivered(
                actor,
                "Ana López",
                Instant.parse("2026-09-28T20:00:00Z")
        );

        assertEquals(DeliveryStatus.DELIVERED, delivery.getStatus());
        assertEquals("Ana López", delivery.getReceivedByName());
        assertEquals(Instant.parse("2026-09-28T20:00:00Z"), delivery.getDeliveredAt());
        assertEquals(actor, delivery.getDeliveredByUser());
    }

    @Test
    void deliveredDeliveryCannotBeCancelled() {
        User actor = mock(User.class);
        Delivery delivery = Delivery.create(
                readyOrder(actor),
                5,
                "Planta principal",
                "Cliente",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                null,
                "PAQUETERIA",
                actor
        );
        delivery.dispatch(actor, null, null, Instant.parse("2026-09-28T18:00:00Z"));
        delivery.markDelivered(actor, "Ana López", Instant.parse("2026-09-28T20:00:00Z"));

        assertThrows(
                IllegalStateException.class,
                () -> delivery.cancel(
                        actor,
                        "No aplica",
                        Instant.parse("2026-09-29T13:00:00Z")
                )
        );
    }

    @Test
    void deliveredDeliveryEvidenceCannotBeReplaced() {
        User actor = mock(User.class);
        var firstEvidence = mock(com.nocountry.qualitytrack.documents.entity.DocumentVersion.class);
        var replacementEvidence = mock(com.nocountry.qualitytrack.documents.entity.DocumentVersion.class);

        Delivery delivery = Delivery.create(
                readyOrder(actor),
                5,
                "Planta principal",
                "Cliente",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                null,
                "PAQUETERIA",
                actor
        );

        delivery.attachEvidence(firstEvidence);
        delivery.dispatch(actor, null, null, Instant.parse("2026-09-28T18:00:00Z"));
        delivery.markDelivered(
                actor,
                "Ana López",
                Instant.parse("2026-09-28T20:00:00Z")
        );

        assertThrows(
                IllegalStateException.class,
                () -> delivery.attachEvidence(replacementEvidence)
        );
    }

    @Test
    void deliveryTimeCannotBeBeforeDispatch() {
        User actor = mock(User.class);
        Delivery delivery = Delivery.create(
                readyOrder(actor),
                5,
                "Planta principal",
                "Cliente",
                "Av. Principal 123",
                "Tepic",
                "Nayarit",
                "63000",
                "México",
                null,
                "PAQUETERIA",
                actor
        );

        delivery.dispatch(
                actor,
                null,
                null,
                Instant.parse("2026-09-28T18:00:00Z")
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> delivery.markDelivered(
                        actor,
                        "Ana López",
                        Instant.parse("2026-09-28T17:59:59Z")
                )
        );
    }

    private WorkOrder readyOrder(User actor) {
        WorkOrder order = WorkOrder.create(
                mock(JobCase.class),
                mock(Quotation.class),
                "OT-DELIVERY-TEST",
                WorkOrderPriority.NORMAL,
                5,
                LocalDate.of(2026, 10, 1),
                LocalDate.of(2026, 10, 15),
                LocalDate.of(2026, 10, 20),
                actor
        );
        order.releaseToProduction();
        order.startProduction(Instant.parse("2026-09-28T08:00:00Z"));
        order.markProductionCompleted(Instant.parse("2026-09-28T16:00:00Z"));
        order.sendToQuality();
        order.approveQuality();
        return order;
    }
}
