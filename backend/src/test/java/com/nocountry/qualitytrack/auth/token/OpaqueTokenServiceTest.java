package com.nocountry.qualitytrack.auth.token;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class OpaqueTokenServiceTest {

    private final OpaqueTokenService service = new OpaqueTokenService();

    @Test
    void generatesRandomTokenAndStoresIndependentHash() {
        OpaqueTokenService.GeneratedOpaqueToken first = service.generate();
        OpaqueTokenService.GeneratedOpaqueToken second = service.generate();

        assertNotEquals(first.value(), first.hash());
        assertNotEquals(first.value(), second.value());
        assertEquals(first.hash(), service.hash(first.value()));
    }
}
