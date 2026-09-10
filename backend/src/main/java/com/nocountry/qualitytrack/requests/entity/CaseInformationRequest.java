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
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "case_information_requests")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CaseInformationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "case_id", nullable = false)
    private JobCase jobCase;

    @Column(nullable = false)
    private String question;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by_user_id", nullable = false)
    private User requestedByUser;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt;

    private String response;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responded_by_user_id")
    private User respondedByUser;

    @Column(name = "responded_at")
    private Instant respondedAt;

    private CaseInformationRequest(
            JobCase jobCase,
            String question,
            User requestedByUser,
            Instant requestedAt
    ) {
        this.jobCase = jobCase;
        this.question = question;
        this.requestedByUser = requestedByUser;
        this.requestedAt = requestedAt;
    }

    public static CaseInformationRequest open(
            JobCase jobCase,
            String question,
            User requestedByUser,
            Instant requestedAt
    ) {
        return new CaseInformationRequest(jobCase, question, requestedByUser, requestedAt);
    }

    public void respond(String response, User respondedByUser, Instant respondedAt) {
        if (this.respondedAt != null) {
            throw new IllegalStateException("La solicitud de información ya fue respondida.");
        }

        this.response = response;
        this.respondedByUser = respondedByUser;
        this.respondedAt = respondedAt;
    }
}
