package com.nocountry.qualitytrack.quotations.service;

import com.nocountry.qualitytrack.quotations.repository.QuotationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;

@Component
@RequiredArgsConstructor
public class QuotationExpirationScheduler {

    private final QuotationRepository quotationRepository;
    private final QuotationExpirationService expirationService;

    @Value("${app.quotations.expiration-zone:America/Mazatlan}")
    private String expirationZone;

    @Scheduled(
            cron = "${app.quotations.expiration-cron:0 */5 * * * *}",
            zone = "${app.quotations.expiration-zone:America/Mazatlan}"
    )
    public void expireSentQuotations() {
        LocalDate today = LocalDate.now(ZoneId.of(expirationZone));
        quotationRepository.findIdsDueForExpiration(today)
                .forEach(id -> expirationService.expireIfDue(id, today));
    }
}
