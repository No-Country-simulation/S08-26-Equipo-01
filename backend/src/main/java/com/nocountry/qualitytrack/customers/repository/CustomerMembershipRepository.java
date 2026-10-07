package com.nocountry.qualitytrack.customers.repository;

import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @EntityGraph(attributePaths = {"user"})
    List<CustomerMembership> findAllByCustomer_IdAndStatusOrderByCreatedAtAsc(
            Long customerId,
            CustomerMembershipStatus status
    );

    List<CustomerMembership> findAllByUser_IdAndStatusOrderByCreatedAtAsc(
            Long userId,
            CustomerMembershipStatus status
    );

    @Query("""
            select membership.customer.id as customerId,
                   count(membership) as total
            from CustomerMembership membership
            where membership.status = :status
            group by membership.customer.id
            """)
    List<CustomerMemberCount> countByCustomerAndStatus(
            @Param("status") CustomerMembershipStatus status
    );

    interface CustomerMemberCount {
        Long getCustomerId();

        long getTotal();
    }
}
