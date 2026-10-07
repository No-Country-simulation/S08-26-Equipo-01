package com.nocountry.qualitytrack.requests.entity;

import com.nocountry.qualitytrack.users.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "case_material_specifications")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CaseMaterialSpecification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false, unique = true)
    private JobCase jobCase;

    @Column(name = "material_name", nullable = false)
    private String materialName;

    @Column(name = "standard_or_grade")
    private String standardOrGrade;

    @Column(name = "technical_notes")
    private String technicalNotes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "defined_by_user_id", nullable = false)
    private User definedByUser;

    @Column(name = "defined_at", nullable = false)
    private Instant definedAt;

    private CaseMaterialSpecification(
            JobCase jobCase,
            String materialName,
            String standardOrGrade,
            String technicalNotes,
            User definedByUser,
            Instant definedAt
    ) {
        this.jobCase = jobCase;
        redefine(materialName, standardOrGrade, technicalNotes, definedByUser, definedAt);
    }

    public static CaseMaterialSpecification define(
            JobCase jobCase,
            String materialName,
            String standardOrGrade,
            String technicalNotes,
            User definedByUser,
            Instant definedAt
    ) {
        return new CaseMaterialSpecification(
                Objects.requireNonNull(jobCase),
                materialName,
                standardOrGrade,
                technicalNotes,
                definedByUser,
                definedAt
        );
    }

    public void redefine(
            String materialName,
            String standardOrGrade,
            String technicalNotes,
            User definedByUser,
            Instant definedAt
    ) {
        this.materialName = requireText(materialName, "El material es obligatorio.");
        this.standardOrGrade = normalizeNullable(standardOrGrade);
        this.technicalNotes = normalizeNullable(technicalNotes);
        this.definedByUser = Objects.requireNonNull(definedByUser);
        this.definedAt = Objects.requireNonNull(definedAt);
    }

    private String requireText(String value, String message) {
        String normalized = normalizeNullable(value);
        if (normalized == null) {
            throw new IllegalArgumentException(message);
        }
        return normalized;
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
