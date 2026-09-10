package com.nocountry.qualitytrack.customers.repository;

import com.nocountry.qualitytrack.customers.entity.CustomerInvitation;
import com.nocountry.qualitytrack.customers.enums.CustomerInvitationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface CustomerInvitationRepository extends JpaRepository<CustomerInvitation, Long> {

    Optional<CustomerInvitation> findByCustomer_IdAndEmailAndStatus(
            Long customerId,
            String email,
            CustomerInvitationStatus status
    );

    List<CustomerInvitation> findAllByCustomer_IdAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(
            Long customerId,
            CustomerInvitationStatus status,
            Instant expiresAt
    );

    Optional<CustomerInvitation> findByTokenHash(String tokenHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select invitation from CustomerInvitation invitation where invitation.tokenHash = :tokenHash")
    Optional<CustomerInvitation> findByTokenHashForUpdate(@Param("tokenHash") String tokenHash);
}
