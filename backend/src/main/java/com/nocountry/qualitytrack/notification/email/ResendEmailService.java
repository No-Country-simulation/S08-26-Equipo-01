package com.nocountry.qualitytrack.notification.email;

import com.nocountry.qualitytrack.notification.email.template.EmailContent;
import com.nocountry.qualitytrack.notification.email.template.TransactionalEmailFactory;
import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;

@RequiredArgsConstructor
public class ResendEmailService implements EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(ResendEmailService.class);

    private final RestClient restClient;
    private final String from;
    private final TransactionalEmailFactory emailFactory;

    @Override
    public void sendVerificationEmail(String recipient, String token) {
        send(recipient, emailFactory.verification(token), "verification");
    }

    @Override
    public void sendPasswordResetEmail(String recipient, String token) {
        send(recipient, emailFactory.passwordReset(token), "password reset");
    }

    @Override
    public void sendCustomerInvitationEmail(
            String recipient,
            String token,
            String customerName,
            String role
    ) {
        send(recipient, emailFactory.customerInvitation(token, customerName, role), "customer invitation");
    }

    private void send(String recipient, EmailContent content, String purpose) {
        try {
            ResendEmailResponse response = restClient.post()
                    .uri("/emails")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(new ResendEmailRequest(
                            from,
                            List.of(recipient),
                            content.subject(),
                            content.html()
                    ))
                    .retrieve()
                    .body(ResendEmailResponse.class);

            if (response == null || response.id() == null || response.id().isBlank()) {
                throw emailUnavailable();
            }

            LOGGER.info("Resend accepted {} email. Message id: {}", purpose, response.id());
        } catch (RestClientException exception) {
            LOGGER.error("Resend failed to send {} email", purpose, exception);
            throw emailUnavailable();
        }
    }

    private BusinessException emailUnavailable() {
        return new BusinessException(
                ApiErrorCode.EMAIL_DELIVERY_FAILED,
                "El servicio de correo no está disponible temporalmente."
        );
    }

    private record ResendEmailRequest(
            String from,
            List<String> to,
            String subject,
            String html
    ) {
    }

    private record ResendEmailResponse(String id) {
    }
}
