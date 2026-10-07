package com.nocountry.qualitytrack.users.util;

import java.util.Locale;
import java.util.Objects;

public final class PersonNameNormalizer {

    private PersonNameNormalizer() {
    }

    public static String normalize(String value) {
        String normalized = Objects.requireNonNull(value, "El nombre no puede ser nulo.")
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase(Locale.ROOT);

        StringBuilder result = new StringBuilder(normalized.length());
        boolean capitalizeNext = true;

        for (int offset = 0; offset < normalized.length();) {
            int codePoint = normalized.codePointAt(offset);

            if (Character.isLetter(codePoint)) {
                result.appendCodePoint(
                        capitalizeNext ? Character.toTitleCase(codePoint) : codePoint
                );
                capitalizeNext = false;
            } else {
                result.appendCodePoint(codePoint);
                capitalizeNext = Character.isWhitespace(codePoint)
                        || codePoint == '-'
                        || codePoint == '\''
                        || codePoint == '’';
            }

            offset += Character.charCount(codePoint);
        }

        return result.toString();
    }
}
