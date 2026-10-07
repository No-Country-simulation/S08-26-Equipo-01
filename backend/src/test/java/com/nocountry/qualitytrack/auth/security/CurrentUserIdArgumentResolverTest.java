package com.nocountry.qualitytrack.auth.security;

import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.context.request.NativeWebRequest;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CurrentUserIdArgumentResolverTest {

    private final CurrentUserIdArgumentResolver resolver = new CurrentUserIdArgumentResolver();

    @Test
    void supportsCurrentUserIdLongParameter() throws Exception {
        Method method = ControllerFixture.class.getDeclaredMethod("securedEndpoint", Long.class);
        MethodParameter parameter = new MethodParameter(method, 0);

        assertTrue(resolver.supportsParameter(parameter));
    }

    @Test
    void resolvesUserIdFromJwtSubject() {
        NativeWebRequest webRequest = mock(NativeWebRequest.class);
        JwtAuthenticationToken authentication = mock(JwtAuthenticationToken.class);
        Jwt jwt = mock(Jwt.class);

        when(webRequest.getUserPrincipal()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getToken()).thenReturn(jwt);
        when(jwt.getSubject()).thenReturn("42");

        Object userId = resolver.resolveArgument(null, null, webRequest, null);

        assertEquals(42L, userId);
    }

    @Test
    void rejectsJwtWithoutNumericSubject() {
        NativeWebRequest webRequest = mock(NativeWebRequest.class);
        JwtAuthenticationToken authentication = mock(JwtAuthenticationToken.class);
        Jwt jwt = mock(Jwt.class);

        when(webRequest.getUserPrincipal()).thenReturn(authentication);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getToken()).thenReturn(jwt);
        when(jwt.getSubject()).thenReturn("not-a-user-id");

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> resolver.resolveArgument(null, null, webRequest, null)
        );

        assertEquals(ApiErrorCode.AUTHENTICATION_REQUIRED, exception.getCode());
    }

    private static class ControllerFixture {
        @SuppressWarnings("unused")
        void securedEndpoint(@CurrentUserId Long currentUserId) {
        }
    }
}
