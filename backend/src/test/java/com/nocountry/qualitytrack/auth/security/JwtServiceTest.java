package com.nocountry.qualitytrack.auth.security;

import com.nocountry.qualitytrack.users.enums.AccountType;
import com.nocountry.qualitytrack.users.enums.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Duration;
import java.util.Base64;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

    private JwtService jwtService;
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void setUp() {
        byte[] keyBytes = Base64.getDecoder().decode(
                "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
        );
        SecretKey key = new SecretKeySpec(keyBytes, "HmacSHA256");

        JwtEncoder encoder = NimbusJwtEncoder.withSecretKey(key)
                .algorithm(MacAlgorithm.HS256)
                .build();
        jwtDecoder = NimbusJwtDecoder.withSecretKey(key)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        jwtService = new JwtService(encoder, Duration.ofMinutes(15), "qualitytrack");
    }

    @Test
    void generatesExpectedClaims() {
        SecurityUser user = new SecurityUser(
                42L,
                "internal@example.com",
                "hash",
                AccountType.INTERNAL,
                UserStatus.ACTIVE,
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );

        JwtService.GeneratedJwt generated = jwtService.generate(user);
        Jwt jwt = jwtDecoder.decode(generated.value());

        assertEquals("42", jwt.getSubject());
        assertEquals("internal@example.com", jwt.getClaimAsString("email"));
        assertEquals("INTERNAL", jwt.getClaimAsString("accountType"));
        assertEquals(List.of("ADMIN"), jwt.getClaimAsStringList("roles"));
        assertEquals(900, generated.expiresIn());
    }

    @Test
    void rejectsTamperedToken() {
        SecurityUser user = new SecurityUser(
                42L,
                "edgar@example.com",
                "hash",
                AccountType.CUSTOMER,
                UserStatus.ACTIVE,
                List.of()
        );
        String token = jwtService.generate(user).value();
        String tampered = tamperSignature(token);

        assertThrows(JwtException.class, () -> jwtDecoder.decode(tampered));
    }

    private String tamperSignature(String token) {
        String[] parts = token.split("\\.", -1);
        String signature = parts[2];
        char replacement = signature.charAt(0) == 'A' ? 'B' : 'A';
        parts[2] = replacement + signature.substring(1);
        return String.join(".", parts);
    }
}
