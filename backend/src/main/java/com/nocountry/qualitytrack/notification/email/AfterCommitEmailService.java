package com.nocountry.qualitytrack.notification.email;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@RequiredArgsConstructor
public class AfterCommitEmailService implements EmailService {

    private final EmailService delegate;

    @Override
    public void sendVerificationEmail(String recipient, String token) {
        executeAfterCommit(() -> delegate.sendVerificationEmail(recipient, token));
    }

    @Override
    public void sendPasswordResetEmail(String recipient, String token) {
        executeAfterCommit(() -> delegate.sendPasswordResetEmail(recipient, token));
    }

    private void executeAfterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()
                && TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
            return;
        }

        action.run();
    }
}
