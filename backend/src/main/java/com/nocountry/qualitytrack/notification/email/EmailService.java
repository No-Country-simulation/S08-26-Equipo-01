package com.nocountry.qualitytrack.notification.email;

import java.util.List;

public interface EmailService {

    void sendVerificationEmail(String recipient, String token);

    void sendPasswordResetEmail(String recipient, String token);

    void sendCustomerInvitationEmail(
            String recipient,
            String token,
            String customerName,
            String role
    );

    void sendInternalInvitationEmail(
            String recipient,
            String token,
            List<String> roles
    );
}
