package com.nocountry.qualitytrack.machines.entity;

import com.nocountry.qualitytrack.machines.enums.MachineStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class MachineTest {

    @Test
    void newMachineStartsAvailable() {
        Machine machine = Machine.create("cnc-01", "Torno CNC", "TURNING");

        assertEquals("CNC-01", machine.getCode());
        assertEquals(MachineStatus.AVAILABLE, machine.getStatus());
    }

    @Test
    void availableMachineCanBeUsedAndReleased() {
        Machine machine = Machine.create("CNC-01", "Torno CNC", "TURNING");

        machine.startUse();
        assertEquals(MachineStatus.IN_USE, machine.getStatus());

        machine.release();
        assertEquals(MachineStatus.AVAILABLE, machine.getStatus());
    }

    @Test
    void machineCannotBeAssignedTwice() {
        Machine machine = Machine.create("CNC-01", "Torno CNC", "TURNING");
        machine.startUse();

        assertThrows(IllegalStateException.class, machine::startUse);
    }
}
