package com.nocountry.qualitytrack.customers.service;

import com.nocountry.qualitytrack.customers.dto.response.CustomerProfileResponse;
import com.nocountry.qualitytrack.customers.enums.CustomerMembershipStatus;
import com.nocountry.qualitytrack.customers.repository.CustomerMembershipRepository;
import com.nocountry.qualitytrack.users.dto.request.ChangeOwnPasswordRequest;
import com.nocountry.qualitytrack.users.dto.request.UpdateOwnProfileRequest;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.service.OwnAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerProfileService {

    private final OwnAccountService ownAccountService;
    private final CustomerMembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public CustomerProfileResponse getOwnProfile(Long currentUserId) {
        User user = ownAccountService.getActiveUser(currentUserId, AccountType.CUSTOMER);
        return buildResponse(user);
    }

    @Transactional
    public CustomerProfileResponse updateOwnProfile(
            Long currentUserId,
            UpdateOwnProfileRequest request
    ) {
        User user = ownAccountService.updateProfile(
                currentUserId,
                AccountType.CUSTOMER,
                request
        );
        return buildResponse(user);
    }

    @Transactional
    public void changeOwnPassword(
            Long currentUserId,
            ChangeOwnPasswordRequest request
    ) {
        ownAccountService.changePassword(currentUserId, AccountType.CUSTOMER, request);
    }

    private CustomerProfileResponse buildResponse(User user) {
        return CustomerProfileResponse.from(
                user,
                membershipRepository.findAllByUser_IdAndStatusOrderByCreatedAtAsc(
                        user.getId(),
                        CustomerMembershipStatus.ACTIVE
                )
        );
    }
}
