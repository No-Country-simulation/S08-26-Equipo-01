package com.nocountry.qualitytrack.customers.service;

import com.nocountry.qualitytrack.customers.dto.request.SaveCustomerAddressRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerAddressResponse;
import com.nocountry.qualitytrack.customers.entity.CustomerAddress;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerAddressRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerAddressService {

    private final CustomerAddressRepository addressRepository;
    private final CustomerMembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public List<CustomerAddressResponse> list(Long currentUserId, Long customerId) {
        requireActiveMembership(currentUserId, customerId);

        return addressRepository
                .findAllByCustomer_IdOrderByDefaultAddressDescCreatedAtAsc(customerId)
                .stream()
                .map(CustomerAddressResponse::from)
                .toList();
    }

    @Transactional
    public CustomerAddressResponse create(
            Long currentUserId,
            Long customerId,
            SaveCustomerAddressRequest request
    ) {
        CustomerMembership membership = requireActiveAdmin(currentUserId, customerId);
        boolean firstAddress = !addressRepository.existsByCustomer_Id(customerId);
        boolean makeDefault = request.defaultAddress() || firstAddress;

        if (makeDefault) {
            clearDefault(customerId);
        }

        CustomerAddress address;
        try {
            address = CustomerAddress.create(
                    membership.getCustomer(),
                    request.label(),
                    request.address(),
                    request.city(),
                    request.state(),
                    request.postalCode(),
                    request.country(),
                    request.contactName(),
                    request.contactPhone(),
                    request.deliveryInstructions(),
                    makeDefault
            );
        } catch (IllegalArgumentException exception) {
            throw validation(exception.getMessage());
        }

        return CustomerAddressResponse.from(addressRepository.saveAndFlush(address));
    }

    @Transactional
    public CustomerAddressResponse update(
            Long currentUserId,
            Long customerId,
            Long addressId,
            SaveCustomerAddressRequest request
    ) {
        requireActiveAdmin(currentUserId, customerId);
        CustomerAddress address = requireAddress(customerId, addressId);

        try {
            address.update(
                    request.label(),
                    request.address(),
                    request.city(),
                    request.state(),
                    request.postalCode(),
                    request.country(),
                    request.contactName(),
                    request.contactPhone(),
                    request.deliveryInstructions()
            );
        } catch (IllegalArgumentException exception) {
            throw validation(exception.getMessage());
        }

        if (request.defaultAddress() && !address.isDefaultAddress()) {
            clearDefault(customerId);
            address.setDefaultAddress(true);
        } else if (!request.defaultAddress() && address.isDefaultAddress()) {
            // Se conserva una dirección predeterminada mientras exista al menos una.
            address.setDefaultAddress(true);
        }

        return CustomerAddressResponse.from(addressRepository.saveAndFlush(address));
    }

    @Transactional
    public void delete(Long currentUserId, Long customerId, Long addressId) {
        requireActiveAdmin(currentUserId, customerId);
        CustomerAddress address = requireAddress(customerId, addressId);
        boolean wasDefault = address.isDefaultAddress();

        addressRepository.delete(address);
        addressRepository.flush();

        if (wasDefault) {
            List<CustomerAddress> remaining =
                    addressRepository.findAllByCustomer_IdOrderByDefaultAddressDescCreatedAtAsc(customerId);
            if (!remaining.isEmpty()) {
                CustomerAddress replacement = remaining.get(0);
                replacement.setDefaultAddress(true);
                addressRepository.saveAndFlush(replacement);
            }
        }
    }

    private CustomerAddress requireAddress(Long customerId, Long addressId) {
        return addressRepository.findByIdAndCustomer_Id(addressId, customerId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la dirección de la empresa."
                ));
    }

    private CustomerMembership requireActiveMembership(Long userId, Long customerId) {
        return membershipRepository.findByCustomer_IdAndUser_IdAndStatus(
                        customerId,
                        userId,
                        CustomerMembershipStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "No tienes acceso a esta empresa."
                ));
    }

    private CustomerMembership requireActiveAdmin(Long userId, Long customerId) {
        CustomerMembership membership = requireActiveMembership(userId, customerId);
        if (membership.getRole() != CustomerMembershipRole.ADMIN) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo un administrador puede gestionar las direcciones guardadas de la empresa."
            );
        }
        return membership;
    }

    private void clearDefault(Long customerId) {
        List<CustomerAddress> addresses =
                addressRepository.findAllByCustomer_IdOrderByDefaultAddressDescCreatedAtAsc(customerId);
        for (CustomerAddress address : addresses) {
            if (address.isDefaultAddress()) {
                address.setDefaultAddress(false);
                addressRepository.save(address);
            }
        }
        addressRepository.flush();
    }

    private BusinessException validation(String message) {
        return new BusinessException(ApiErrorCode.VALIDATION_ERROR, message);
    }
}
