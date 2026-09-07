package com.nocountry.qualitytrack.auth.service;

import com.nocountry.qualitytrack.auth.dto.request.RegisterRequest;
import com.nocountry.qualitytrack.auth.dto.response.RegisterResponse;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import com.nocountry.qualitytrack.users.entity.User;
import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import com.nocountry.qualitytrack.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailVerificationService emailVerificationService;

    private RegistrationService service;

    @BeforeEach
    void setUp() {
        service = new RegistrationService(userRepository, passwordEncoder, emailVerificationService);
    }

    @Test
    void registersCustomerWithNormalizedEmailAndHashedPassword() {
        RegisterRequest request = new RegisterRequest(
                " Edgar ",
                " Camberos ",
                " Edgar@Example.COM ",
                "securePass123"
        );

        when(userRepository.existsByEmail("edgar@example.com")).thenReturn(false);
        when(passwordEncoder.encode("securePass123")).thenReturn("bcrypt-hash");
        when(userRepository.saveAndFlush(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegisterResponse response = service.registerCustomer(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).saveAndFlush(captor.capture());
        User saved = captor.getValue();

        assertEquals("Edgar", saved.getFirstName());
        assertEquals("Camberos", saved.getLastName());
        assertEquals("edgar@example.com", saved.getEmail());
        assertEquals("bcrypt-hash", saved.getPasswordHash());
        assertEquals(AccountType.CUSTOMER, saved.getAccountType());
        assertEquals(UserStatus.PENDING_VERIFICATION, saved.getStatus());
        assertEquals("edgar@example.com", response.email());
        assertEquals(UserStatus.PENDING_VERIFICATION, response.status());
        verify(emailVerificationService).issueVerification(saved);
    }

    @Test
    void rejectsDuplicateEmail() {
        RegisterRequest request = new RegisterRequest(
                "Edgar",
                "Camberos",
                "edgar@example.com",
                "securePass123"
        );
        when(userRepository.existsByEmail("edgar@example.com")).thenReturn(true);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> service.registerCustomer(request)
        );

        assertEquals(ApiErrorCode.EMAIL_ALREADY_EXISTS, exception.getCode());
    }
}
