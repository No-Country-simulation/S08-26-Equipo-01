package com.nocountry.qualitytrack.users.bootstrap;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.bootstrap.admin")
@Getter
@Setter
public class BootstrapAdminProperties {

    private boolean enabled = false;
    private String firstName = "";
    private String lastName = "";
    private String email = "";
    private String password = "";
}
