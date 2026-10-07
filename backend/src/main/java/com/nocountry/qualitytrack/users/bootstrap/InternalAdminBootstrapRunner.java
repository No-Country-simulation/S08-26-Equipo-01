package com.nocountry.qualitytrack.users.bootstrap;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InternalAdminBootstrapRunner implements ApplicationRunner {

    private final InternalAdminBootstrapService bootstrapService;
    private final BootstrapAdminProperties properties;

    @Override
    public void run(ApplicationArguments args) {
        bootstrapService.bootstrap(properties);
    }
}
