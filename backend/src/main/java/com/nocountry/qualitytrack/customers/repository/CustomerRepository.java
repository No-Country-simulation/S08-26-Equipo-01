package com.nocountry.qualitytrack.customers.repository;

import com.nocountry.qualitytrack.customers.entity.Customer;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query("""
            select customer
            from Customer customer
            where lower(customer.name) like :pattern
               or lower(coalesce(customer.rfc, '')) like :pattern
               or lower(coalesce(customer.administrativeEmail, '')) like :pattern
               or lower(coalesce(customer.phone, '')) like :pattern
               or lower(coalesce(customer.city, '')) like :pattern
               or lower(coalesce(customer.state, '')) like :pattern
            order by customer.updatedAt desc, customer.id desc
            """)
    List<Customer> searchInternal(
            @Param("pattern") String pattern,
            Pageable pageable
    );

    List<Customer> findAllByOrderByNameAscIdAsc();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Customer c where c.id = :customerId")
    Optional<Customer> findByIdForUpdate(@Param("customerId") Long customerId);
}
