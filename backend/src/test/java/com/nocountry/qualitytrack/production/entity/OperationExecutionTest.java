package com.nocountry.qualitytrack.production.entity;

import com.nocountry.qualitytrack.production.enums.OperationExecutionStatus;
import com.nocountry.qualitytrack.routing.entity.RoutingOperation;
import com.nocountry.qualitytrack.routing.entity.RoutingSheet;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.workorders.entity.WorkOrder;
import com.nocountry.qualitytrack.workorders.enums.WorkOrderStatus;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OperationExecutionTest {

    @Test
    void startCreatesInProgressExecutionWithoutActualQuantities() {
        RoutingOperation operation = releasedOperation();
        User operator = mock(User.class);
        Instant startedAt = Instant.parse("2026-09-28T08:00:00Z");

        OperationExecution execution = OperationExecution.start(
                operation,
                operator,
                null,
                1,
                "Inicio de corte.",
                startedAt
        );

        assertEquals(OperationExecutionStatus.IN_PROGRESS, execution.getStatus());
        assertEquals(1, execution.getAttemptNumber());
        assertEquals(startedAt, execution.getStartedAt());
        assertNull(execution.getFinishedAt());
        assertEquals(0, execution.getQuantityProcessed());
        assertEquals(0, execution.getQuantityAccepted());
        assertEquals(0, execution.getQuantityRejected());
        assertEquals("Inicio de corte.", execution.getStartNotes());
        assertNull(execution.getCompletionNotes());
        assertNull(execution.getCancellationReason());
    }

    @Test
    void completeRequiresProcessedEqualsAcceptedPlusRejected() {
        OperationExecution execution = OperationExecution.start(
                releasedOperation(),
                mock(User.class),
                null,
                1,
                null,
                Instant.parse("2026-09-28T08:00:00Z")
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> execution.complete(
                        20,
                        18,
                        1,
                        null,
                        Instant.parse("2026-09-28T09:00:00Z")
                )
        );
    }

    @Test
    void completeStoresActualQuantitiesAndFinishTime() {
        OperationExecution execution = OperationExecution.start(
                releasedOperation(),
                mock(User.class),
                null,
                1,
                null,
                Instant.parse("2026-09-28T08:00:00Z")
        );
        Instant finishedAt = Instant.parse("2026-09-28T09:00:00Z");

        execution.complete(20, 19, 1, "Operación terminada.", finishedAt);

        assertEquals(OperationExecutionStatus.COMPLETED, execution.getStatus());
        assertEquals(20, execution.getQuantityProcessed());
        assertEquals(19, execution.getQuantityAccepted());
        assertEquals(1, execution.getQuantityRejected());
        assertEquals(finishedAt, execution.getFinishedAt());
        assertEquals("Operación terminada.", execution.getCompletionNotes());
        assertNull(execution.getCancellationReason());
    }

    @Test
    void cancelledExecutionCanBeRetriedAsAnotherAttemptLater() {
        OperationExecution execution = OperationExecution.start(
                releasedOperation(),
                mock(User.class),
                null,
                1,
                null,
                Instant.parse("2026-09-28T08:00:00Z")
        );

        execution.cancel(
                "Se inició con configuración incorrecta.",
                Instant.parse("2026-09-28T08:10:00Z")
        );

        assertEquals(OperationExecutionStatus.CANCELLED, execution.getStatus());
        assertEquals(
                "Se inició con configuración incorrecta.",
                execution.getCancellationReason()
        );
        assertNull(execution.getCompletionNotes());
        assertThrows(
                IllegalStateException.class,
                () -> execution.complete(
                        20,
                        20,
                        0,
                        null,
                        Instant.parse("2026-09-28T09:00:00Z")
                )
        );
    }

    @Test
    void draftRoutingCannotBeExecuted() {
        WorkOrder workOrder = mock(WorkOrder.class);
        when(workOrder.getStatus()).thenReturn(WorkOrderStatus.CREATED);
        RoutingSheet sheet = RoutingSheet.createProduction(workOrder, mock(User.class));
        RoutingOperation operation = sheet.addOperation(
                10,
                "CUT",
                "Corte",
                null,
                30
        );

        assertThrows(
                IllegalStateException.class,
                () -> OperationExecution.start(
                        operation,
                        mock(User.class),
                        null,
                        1,
                        null,
                        Instant.now()
                )
        );
    }

    private RoutingOperation releasedOperation() {
        WorkOrder workOrder = mock(WorkOrder.class);
        when(workOrder.getStatus()).thenReturn(WorkOrderStatus.CREATED);

        User actor = mock(User.class);
        RoutingSheet sheet = RoutingSheet.createProduction(workOrder, actor);
        RoutingOperation operation = sheet.addOperation(
                10,
                "CUT",
                "Corte",
                "Preparar material.",
                30
        );
        sheet.approve(actor, Instant.parse("2026-09-27T10:00:00Z"));
        sheet.release(actor, Instant.parse("2026-09-27T11:00:00Z"));
        return operation;
    }
}
