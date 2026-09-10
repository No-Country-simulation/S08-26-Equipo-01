package com.nocountry.qualitytrack.customers.service;

import com.nocountry.qualitytrack.customers.dto.request.CreateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.request.UpdateCustomerRequest;
import com.nocountry.qualitytrack.customers.dto.response.CustomerMemberResponse;
import com.nocountry.qualitytrack.customers.dto.response.CustomerResponse;
import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.entity.CustomerMembership;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipRole;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional
    public CustomerResponse createCustomer(Long currentUserId, CreateCustomerRequest request) {
        User creator = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró el usuario autenticado."
                ));

        if (creator.getAccountType() != AccountType.CUSTOMER) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo una cuenta de cliente puede crear una empresa."
            );
        }

        Customer customer = Customer.create(
                request.name().trim(),
                normalizeNullable(request.rfc()),
                normalizeNullable(request.phone()),
                normalizeNullable(request.administrativeEmail()),
                normalizeNullable(request.city()),
                normalizeNullable(request.state()),
                normalizeNullable(request.website()),
                creator
        );

        customer = customerRepository.saveAndFlush(customer);

        CustomerMembership initialMembership = CustomerMembership.initialAdmin(
                customer,
                creator,
                Instant.now()
        );
        membershipRepository.save(initialMembership);

        return CustomerResponse.from(customer);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomer(Long currentUserId, Long customerId) {
        requireActiveMembership(currentUserId, customerId);
        return CustomerResponse.from(findCustomer(customerId));
    }

    @Transactional
    public CustomerResponse updateCustomer(
            Long currentUserId,
            Long customerId,
            UpdateCustomerRequest request
    ) {
        requireActiveAdmin(currentUserId, customerId);
        validateUpdateHasChanges(request);

        Customer customer = findCustomer(customerId);
        customer.updateDetails(
                resolveName(request.name(), customer.getName()),
                resolveNullableUpdate(request.rfc(), customer.getRfc()),
                resolveNullableUpdate(request.phone(), customer.getPhone()),
                resolveNullableUpdate(request.administrativeEmail(), customer.getAdministrativeEmail()),
                resolveNullableUpdate(request.city(), customer.getCity()),
                resolveNullableUpdate(request.state(), customer.getState()),
                resolveNullableUpdate(request.website(), customer.getWebsite())
        );

        return CustomerResponse.from(customerRepository.saveAndFlush(customer));
    }

    @Transactional(readOnly = true)
    public List<CustomerMemberResponse> listMembers(Long currentUserId, Long customerId) {
        requireActiveMembership(currentUserId, customerId);

        return membershipRepository.findAllByCustomer_IdAndStatusOrderByCreatedAtAsc(
                        customerId,
                        CustomerMembershipStatus.ACTIVE
                )
                .stream()
                .map(CustomerMemberResponse::from)
                .toList();
    }

    @Transactional
    public void removeMember(Long currentUserId, Long customerId, Long userId) {
        customerRepository.findByIdForUpdate(customerId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la empresa."
                ));

        CustomerMembership actorMembership = requireActiveAdmin(currentUserId, customerId);
        CustomerMembership targetMembership = membershipRepository
                .findByCustomer_IdAndUser_IdAndStatus(
                        customerId,
                        userId,
                        CustomerMembershipStatus.ACTIVE
                )
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró una membresía activa para ese usuario."
                ));

        if (targetMembership.getRole() == CustomerMembershipRole.ADMIN) {
            long activeAdmins = membershipRepository.countByCustomer_IdAndRoleAndStatus(
                    customerId,
                    CustomerMembershipRole.ADMIN,
                    CustomerMembershipStatus.ACTIVE
            );

            if (activeAdmins <= 1) {
                throw new BusinessException(
                        ApiErrorCode.DATA_CONFLICT,
                        "No se puede retirar al último administrador activo de la empresa."
                );
            }
        }

        targetMembership.remove(actorMembership.getUser(), Instant.now());
        membershipRepository.save(targetMembership);
    }

    private Customer findCustomer(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la empresa."
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
                    "Solo un administrador de la empresa puede realizar esta acción."
            );
        }

        return membership;
    }

    private void validateUpdateHasChanges(UpdateCustomerRequest request) {
        if (request.name() == null
                && request.rfc() == null
                && request.phone() == null
                && request.administrativeEmail() == null
                && request.city() == null
                && request.state() == null
                && request.website() == null) {
            throw new BusinessException(
                    ApiErrorCode.VALIDATION_ERROR,
                    "Debes indicar al menos un campo para actualizar."
            );
        }
    }

    private String resolveName(String requestedName, String currentName) {
        if (requestedName == null) {
            return currentName;
        }

        String normalized = requestedName.trim();
        if (normalized.isEmpty()) {
            throw new BusinessException(
                    ApiErrorCode.VALIDATION_ERROR,
                    "El nombre de la empresa no puede estar vacío."
            );
        }
        return normalized;
    }

    private String resolveNullableUpdate(String requestedValue, String currentValue) {
        return requestedValue == null ? currentValue : normalizeNullable(requestedValue);
    }

    private String normalizeNullable(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
