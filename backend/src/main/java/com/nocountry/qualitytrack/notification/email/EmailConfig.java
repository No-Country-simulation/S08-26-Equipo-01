package com.nocountry.qualitytrack.notification.email;

import com.nocountry.qualitytrack.notification.email.template.TransactionalEmailFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class EmailConfig {

    @Bean
    EmailService emailService(
            TransactionalEmailFactory emailFactory,
            @Value("${app.email.resend.api-key}") String resendApiKey,
            @Value("${app.email.resend.from}") String resendFrom,
            @Value("${app.email.resend.connect-timeout:3s}") Duration connectTimeout,
            @Value("${app.email.resend.read-timeout:5s}") Duration readTimeout
    ) {
        if (resendApiKey == null || resendApiKey.isBlank()) {
            throw new IllegalStateException("RESEND_APIKEY must be configured.");
        }

        if (resendFrom == null || resendFrom.isBlank()) {
            throw new IllegalStateException("RESEND_EMAIL must be configured.");
        }

        validateTimeout(connectTimeout, "RESEND_CONNECT_TIMEOUT");
        validateTimeout(readTimeout, "RESEND_READ_TIMEOUT");

        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeout);
        requestFactory.setReadTimeout(readTimeout);

        RestClient restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey.trim())
                .requestFactory(requestFactory)
                .build();

        EmailService resendEmailService = new ResendEmailService(restClient, resendFrom.trim(), emailFactory);
        return new AfterCommitEmailService(resendEmailService);
    }

    private void validateTimeout(Duration timeout, String environmentVariable) {
        if (timeout == null || timeout.isZero() || timeout.isNegative()) {
            throw new IllegalStateException(environmentVariable + " must be greater than zero.");
        }
    }
}
