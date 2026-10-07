package com.nocountry.qualitytrack.auth.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class JwtService {

    private static final String ROLE_PREFIX = "ROLE_";

    private final JwtEncoder jwtEncoder;
    private final Duration accessExpiration;
    private final String issuer;

    public JwtService(
            JwtEncoder jwtEncoder,
            @Value("${security.jwt.access-expiration:15m}") Duration accessExpiration,
            @Value("${security.jwt.issuer:qualitytrack}") String issuer
    ) {
        this.jwtEncoder = jwtEncoder;
        this.accessExpiration = accessExpiration;
        this.issuer = issuer;
    }

    public GeneratedJwt generate(SecurityUser user) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(accessExpiration);

        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith(ROLE_PREFIX))
                .map(authority -> authority.substring(ROLE_PREFIX.length()))
                .toList();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .subject(user.getId().toString())
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .claim("email", user.getEmail())
                .claim("accountType", user.getAccountType().name())
                .claim("roles", roles)
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256)
                .type("JWT")
                .build();

        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new GeneratedJwt(token, accessExpiration.toSeconds());
    }

    public record GeneratedJwt(String value, long expiresIn) {
    }
}
