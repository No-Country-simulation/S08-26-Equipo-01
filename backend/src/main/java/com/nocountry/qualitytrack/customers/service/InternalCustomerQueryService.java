package com.nocountry.qualitytrack.customers.service;

import com.nocountry.qualitytrack.customers.dto.response.CustomerMemberResponse;
import com.nocountry.qualitytrack.customers.dto.response.InternalCustomerDetailResponse;
import com.nocountry.qualitytrack.customers.dto.response.InternalCustomerSummaryResponse;
import com.nocountry.qualitytrack.customers.entity.Customer;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.customers.repository.CustomerRepository;
import com.nocountry.qualitytrack.requests.dto.response.JobCaseResponse;
import com.nocountry.qualitytrack.requests.enums.JobCaseStatus;
import com.nocountry.qualitytrack.requests.repository.JobCaseRepository;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class InternalCustomerQueryService {

    private final CustomerRepository customerRepository;
    private final CustomerMembershipRepository membershipRepository;
    private final JobCaseRepository jobCaseRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<InternalCustomerSummaryResponse> list(Long currentUserId) {
        requireInternalReader(currentUserId);

        Map<Long, Long> activeMembers = new HashMap<>();
        membershipRepository.countByCustomerAndStatus(CustomerMembershipStatus.ACTIVE)
                .forEach(row -> activeMembers.put(row.getCustomerId(), row.getTotal()));

        Map<Long, EnumMap<JobCaseStatus, Long>> caseCounts = caseCounts();

        return customerRepository.findAllByOrderByNameAscIdAsc()
                .stream()
                .map(customer -> summary(
                        customer,
                        activeMembers.getOrDefault(customer.getId(), 0L),
                        caseCounts.get(customer.getId())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public InternalCustomerDetailResponse get(Long currentUserId, Long customerId) {
        requireInternalReader(currentUserId);

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.RESOURCE_NOT_FOUND,
                        "No se encontró la empresa."
                ));

        List<CustomerMemberResponse> members = membershipRepository
                .findAllByCustomer_IdAndStatusOrderByCreatedAtAsc(
                        customerId,
                        CustomerMembershipStatus.ACTIVE
                )
                .stream()
                .map(CustomerMemberResponse::from)
                .toList();

        List<JobCaseResponse> jobCases = jobCaseRepository
                .findAllByCustomerRequest_Customer_IdOrderByOpenedAtDesc(customerId)
                .stream()
                .map(JobCaseResponse::from)
                .toList();

        EnumMap<JobCaseStatus, Long> counts = new EnumMap<>(JobCaseStatus.class);
        jobCases.forEach(jobCase -> counts.merge(jobCase.status(), 1L, Long::sum));

        return new InternalCustomerDetailResponse(
                summary(customer, members.size(), counts),
                members,
                jobCases
        );
    }

    private InternalCustomerSummaryResponse summary(
            Customer customer,
            long activeMembers,
            Map<JobCaseStatus, Long> counts
    ) {
        Map<JobCaseStatus, Long> safeCounts = counts == null ? Map.of() : counts;

        long completed = safeCounts.getOrDefault(JobCaseStatus.COMPLETED, 0L);
        long cancelled = safeCounts.getOrDefault(JobCaseStatus.CANCELLED, 0L);
        long open = safeCounts.entrySet()
                .stream()
                .filter(entry -> entry.getKey() != JobCaseStatus.COMPLETED)
                .filter(entry -> entry.getKey() != JobCaseStatus.CANCELLED)
                .mapToLong(Map.Entry::getValue)
                .sum();

        return InternalCustomerSummaryResponse.from(
                customer,
                activeMembers,
                open,
                completed,
                cancelled
        );
    }

    private Map<Long, EnumMap<JobCaseStatus, Long>> caseCounts() {
        Map<Long, EnumMap<JobCaseStatus, Long>> grouped = new HashMap<>();

        jobCaseRepository.countByCustomerAndStatus().forEach(row -> {
            EnumMap<JobCaseStatus, Long> byStatus = grouped.computeIfAbsent(
                    row.getCustomerId(),
                    ignored -> new EnumMap<>(JobCaseStatus.class)
            );
            byStatus.put(row.getStatus(), row.getTotal());
        });

        return grouped;
    }

    private void requireInternalReader(Long currentUserId) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException(
                        ApiErrorCode.ACCESS_DENIED,
                        "Solo un usuario interno activo puede consultar clientes."
                ));

        if (user.getAccountType() != AccountType.INTERNAL
                || user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(
                    ApiErrorCode.ACCESS_DENIED,
                    "Solo un usuario interno activo puede consultar clientes."
            );
        }
    }
}
