package com.nocountry.qualitytrack.customers.repository;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerMembershipRepository extends JpaRepository<CustomerMembership, Long> {

    boolean existsByCustomer_IdAndUser_IdAndStatus(
            Long customerId,
            Long userId,
            CustomerMembershipStatus status
    );

    Optional<CustomerMembership> findByCustomer_IdAndUser_Id(Long customerId, Long userId);

    Optional<CustomerMembership> findByCustomer_IdAndUser_IdAndStatus(
            Long customerId,
            Long userId,
            CustomerMembershipStatus status
    );

    long countByCustomer_IdAndRoleAndStatus(
            Long customerId,
            CustomerMembershipRole role,
            CustomerMembershipStatus status
    );

    List<CustomerMembership> findAllByCustomer_IdAndStatusOrderByCreatedAtAsc(
            Long customerId,
            CustomerMembershipStatus status
    );
}
