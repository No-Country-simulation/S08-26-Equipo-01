package com.nocountry.qualitytrack.notification.email;

import com.nocountry.qualitytrack.notification.email.template.TransactionalEmailFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;

@Configuration
public class EmailConfig {

    @Bean
    EmailService emailService(
            TransactionalEmailFactory emailFactory,
            @Value("${app.email.resend.api-key}") String resendApiKey,
            @Value("${app.email.resend.from}") String resendFrom
    ) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException("RESEND_APIKEY must be configured.");
        }

        if (resendFrom == null || resendFrom.isBlank()) {
            throw new IllegalStateException("RESEND_EMAIL must be configured.");
        }

        RestClient restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey.trim())
                .build();

        return new ResendEmailService(restClient, resendFrom.trim(), emailFactory);
    }
}
