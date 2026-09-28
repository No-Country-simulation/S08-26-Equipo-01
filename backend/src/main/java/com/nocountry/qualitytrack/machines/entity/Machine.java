package com.nocountry.qualitytrack.machines.entity;

import com.nocountry.qualitytrack.machines.enums.MachineStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "machines")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column
    private String type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MachineStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    private Machine(String code, String name, String type) {
        this.code = requireText(code, "El código de máquina es obligatorio.").toUpperCase();
        this.name = requireText(name, "El nombre de máquina es obligatorio.");
        this.type = normalizeOptional(type);
        this.status = MachineStatus.AVAILABLE;
    }

    public static Machine create(String code, String name, String type) {
        return new Machine(code, name, type);
    }

    public void startUse() {
        if (status != MachineStatus.AVAILABLE) {
            throw new IllegalStateException("La máquina debe estar AVAILABLE para iniciar una operación.");
        }
        this.status = MachineStatus.IN_USE;
    }

    public void release() {
        if (status != MachineStatus.IN_USE) {
            throw new IllegalStateException("Solo una máquina IN_USE puede liberarse.");
        }
        this.status = MachineStatus.AVAILABLE;
    }

    private static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private static String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
