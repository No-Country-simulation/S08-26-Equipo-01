package com.nocountry.qualitytrack.notification.email;

public interface EmailService {

    void sendVerificationEmail(String recipient, String token);

    void sendPasswordResetEmail(String recipient, String token);

    void sendCustomerInvitationEmail(
            String recipient,
            String token,
            String customerName,
            String role
    );
}
