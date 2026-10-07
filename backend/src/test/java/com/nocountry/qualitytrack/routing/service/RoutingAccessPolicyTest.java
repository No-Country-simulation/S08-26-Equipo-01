package com.nocountry.qualitytrack.routing.service;

import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoutingAccessPolicyTest {

    @Mock private UserRepository userRepository;
    @Mock private UserSystemRoleRepository roleRepository;
    @Mock private User user;
    @Mock private UserSystemRole role;

    private RoutingAccessPolicy policy;

    @BeforeEach
    void setUp() {
        policy = new RoutingAccessPolicy(userRepository, roleRepository);
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));
        when(user.getAccountType()).thenReturn(AccountType.INTERNAL);
    }

    @Test
    void engineeringCanDesignRouting() {
        when(roleRepository.findAllByIdUserId(10L)).thenReturn(List.of(role));
        when(role.getRole()).thenReturn(SystemRole.ENGINEERING);

        assertSame(user, policy.requireDesignerActor(10L));
    }

    @Test
    void productionCannotDesignRouting() {
        when(roleRepository.findAllByIdUserId(10L)).thenReturn(List.of(role));
        when(role.getRole()).thenReturn(SystemRole.PRODUCTION);

        assertThrows(BusinessException.class, () -> policy.requireDesignerActor(10L));
    }

    @Test
    void productionCanReadRouting() {
        when(roleRepository.findAllByIdUserId(10L)).thenReturn(List.of(role));
        when(role.getRole()).thenReturn(SystemRole.PRODUCTION);

        policy.requireInternalReader(10L);
    }
}
