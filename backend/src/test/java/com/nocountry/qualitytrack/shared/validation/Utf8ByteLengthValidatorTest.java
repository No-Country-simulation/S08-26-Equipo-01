package com.nocountry.qualitytrack.shared.validation;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class Utf8ByteLengthValidatorTest {

    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void acceptsValueAtUtf8ByteLimit() {
        PasswordHolder holder = new PasswordHolder("a".repeat(72));

        assertTrue(validator.validate(holder).isEmpty());
    }

    @Test
    void rejectsValueThatFitsCharacterCountButExceedsUtf8ByteLimit() {
        PasswordHolder holder = new PasswordHolder("á".repeat(40));

        assertFalse(validator.validate(holder).isEmpty());
    }

    private record PasswordHolder(
            @Utf8ByteLength(max = 72)
            String password
    ) {
    }
}
