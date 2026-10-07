package com.nocountry.qualitytrack.users.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PersonNameNormalizerTest {

    @Test
    void normalizesCaseAndRepeatedSpaces() {
        assertEquals(
                "Edgar Ulises",
                PersonNameNormalizer.normalize("  EDGAR   ulises  ")
        );
    }

    @Test
    void capitalizesNamesSeparatedByHyphenAndApostrophe() {
        assertEquals("Juan-Pablo", PersonNameNormalizer.normalize("juan-pablo"));
        assertEquals("O'Connor", PersonNameNormalizer.normalize("o'connor"));
    }

    @Test
    void preservesAccentedLetters() {
        assertEquals(
                "Ángel Íñiguez",
                PersonNameNormalizer.normalize("ángel íÑIGUEZ")
        );
    }
}
