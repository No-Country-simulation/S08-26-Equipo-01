package com.nocountry.qualitytrack.notification.email;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class AfterCommitEmailServiceTest {

    @Mock
    private EmailService delegate;

    private AfterCommitEmailService service;

    @BeforeEach
    void setUp() {
        service = new AfterCommitEmailService(delegate);
    }

    @AfterEach
    void clearTransactionState() {
        TransactionSynchronizationManager.clear();
    }

    @Test
    void defersEmailDeliveryUntilTransactionCommits() {
        TransactionSynchronizationManager.initSynchronization();
        TransactionSynchronizationManager.setActualTransactionActive(true);

        service.sendVerificationEmail("user@example.com", "verification-token");

        verifyNoInteractions(delegate);
        TransactionSynchronizationManager.getSynchronizations()
                .forEach(TransactionSynchronization::afterCommit);
        verify(delegate).sendVerificationEmail("user@example.com", "verification-token");
    }

    @Test
    void sendsImmediatelyWhenThereIsNoTransaction() {
        service.sendPasswordResetEmail("user@example.com", "reset-token");

        verify(delegate).sendPasswordResetEmail("user@example.com", "reset-token");
    }
}
