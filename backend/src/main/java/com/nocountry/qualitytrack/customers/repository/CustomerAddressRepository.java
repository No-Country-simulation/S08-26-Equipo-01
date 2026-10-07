package com.nocountry.qualitytrack.customers.repository;

import com.nocountry.qualitytrack.customers.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {

    List<CustomerAddress> findAllByCustomer_IdOrderByDefaultAddressDescCreatedAtAsc(Long customerId);

    Optional<CustomerAddress> findByIdAndCustomer_Id(Long addressId, Long customerId);

    boolean existsByCustomer_Id(Long customerId);
}
