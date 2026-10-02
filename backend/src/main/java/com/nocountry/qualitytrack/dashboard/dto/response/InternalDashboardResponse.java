package com.nocountry.qualitytrack.dashboard.dto.response;

import com.nocountry.qualitytrack.traceability.enums.TraceabilityEventType;

import java.time.Instant;
import java.util.List;

public record InternalDashboardResponse(
        Overview overview,
        Pipeline pipeline,
        Commercial commercial,
        List<AttentionItem> attention,
        List<RecentActivity> recentActivity
) {
    public record Overview(
            long openCases,
            long activeProduction,
            long qualityAttention,
            long readyForDelivery
    ) {
    }

    public record Pipeline(
            long submitted,
            long underReview,
            long waitingCustomerInfo,
            long readyForQuotation,
            long awaitingWorkOrder,
            long inProduction,
            long completed
    ) {
    }

    public record Commercial(
            long draftQuotations,
            long sentQuotations
    ) {
    }

    public record AttentionItem(
            String key,
            String label,
            String description,
            long count,
            String tone,
            String href
    ) {
    }

    public record RecentActivity(
            Long eventId,
            Long caseId,
            String caseNumber,
            TraceabilityEventType eventType,
            String performedByName,
            Instant occurredAt
    ) {
    }
}
