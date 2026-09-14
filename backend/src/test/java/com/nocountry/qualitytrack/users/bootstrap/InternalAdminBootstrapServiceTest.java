package com.nocountry.qualitytrack.users.bootstrap;

import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.entity.UserSystemRole;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.SystemRole;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import com.nocountry.qualitytrack.users.repository.UserSystemRoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InternalAdminBootstrapServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserSystemRoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private InternalAdminBootstrapService service;

    @BeforeEach
    void setUp() {
        service = new InternalAdminBootstrapService(userRepository, roleRepository, passwordEncoder);
    }

    @Test
    void createsInitialInternalAdmin() {
        BootstrapAdminProperties properties = enabledProperties();

        when(roleRepository.existsById_RoleAndUser_AccountType(SystemRole.ADMIN, AccountType.INTERNAL))
                .thenReturn(false);
        when(userRepository.findByEmailIgnoreCase("admin@qualitytrack.local"))
                .thenReturn(Optional.empty());
        when(passwordEncoder.encode("SecurePass123"))
                .thenReturn("bcrypt-hash");
        when(userRepository.saveAndFlush(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.bootstrap(properties);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(userCaptor.capture());
        User savedUser = userCaptor.getValue();

        assertEquals("Edgar", savedUser.getFirstName());
        assertEquals("Camberos", savedUser.getLastName());
        assertEquals("admin@qualitytrack.local", savedUser.getEmail());
        assertEquals("bcrypt-hash", savedUser.getPasswordHash());
        assertEquals(AccountType.INTERNAL, savedUser.getAccountType());
        assertEquals(UserStatus.ACTIVE, savedUser.getStatus());

        ArgumentCaptor<UserSystemRole> roleCaptor = ArgumentCaptor.forClass(UserSystemRole.class);
        verify(roleRepository).saveAndFlush(roleCaptor.capture());
        assertEquals(SystemRole.ADMIN, roleCaptor.getValue().getRole());
    }

    @Test
    void skipsBootstrapWhenInternalAdminAlreadyExists() {
        BootstrapAdminProperties properties = enabledProperties();

        when(roleRepository.existsById_RoleAndUser_AccountType(SystemRole.ADMIN, AccountType.INTERNAL))
                .thenReturn(true);

        service.bootstrap(properties);

        verifyNoInteractions(userRepository, passwordEncoder);
        verify(roleRepository, never()).saveAndFlush(any(UserSystemRole.class));
    }

    @Test
    void rejectsBootstrapWhenConfiguredEmailAlreadyBelongsToAnotherAccount() {
        BootstrapAdminProperties properties = enabledProperties();
        User existingCustomer = User.registerCustomer(
                "Existing",
                "Customer",
                "admin@qualitytrack.local",
                "existing-hash"
        );

        when(roleRepository.existsById_RoleAndUser_AccountType(SystemRole.ADMIN, AccountType.INTERNAL))
                .thenReturn(false);
        when(userRepository.findByEmailIgnoreCase("admin@qualitytrack.local"))
                .thenReturn(Optional.of(existingCustomer));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> service.bootstrap(properties)
        );

        assertEquals(
                "No fue posible crear el administrador inicial: el correo configurado ya pertenece a otra cuenta.",
                exception.getMessage()
        );
        verifyNoInteractions(passwordEncoder);
        verify(userRepository, never()).saveAndFlush(any(User.class));
        verify(roleRepository, never()).saveAndFlush(any(UserSystemRole.class));
    }

    private BootstrapAdminProperties enabledProperties() {
        BootstrapAdminProperties properties = new BootstrapAdminProperties();
        properties.setEnabled(true);
        properties.setFirstName(" Edgar ");
        properties.setLastName(" Camberos ");
        properties.setEmail(" Admin@QualityTrack.Local ");
        properties.setPassword("SecurePass123");
        return properties;
    }
}
