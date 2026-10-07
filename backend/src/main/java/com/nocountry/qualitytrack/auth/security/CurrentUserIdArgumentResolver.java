package com.nocountry.qualitytrack.auth.security;

import com.nocountry.qualitytrack.shared.exception.ApiErrorCode;
import com.nocountry.qualitytrack.shared.exception.BusinessException;
import org.springframework.core.MethodParameter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.security.Principal;

@Component
public class CurrentUserIdArgumentResolver implements HandlerMethodArgumentResolver {

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUserId.class)
                && Long.class.equals(parameter.getParameterType());
    }

    @Override
    public Object resolveArgument(
            MethodParameter parameter,
            ModelAndViewContainer mavContainer,
            NativeWebRequest webRequest,
            WebDataBinderFactory binderFactory
    ) {
        Principal principal = webRequest.getUserPrincipal();

        if (!(principal instanceof JwtAuthenticationToken authentication) || !authentication.isAuthenticated()) {
            throw authenticationRequired();
        }

        String subject = authentication.getToken().getSubject();
        if (subject == null || subject.isBlank()) {
            throw authenticationRequired();
        }

        try {
            return Long.valueOf(subject);
        } catch (NumberFormatException exception) {
            throw authenticationRequired();
        }
    }

    private BusinessException authenticationRequired() {
        return new BusinessException(
                ApiErrorCode.AUTHENTICATION_REQUIRED,
                "No se pudo identificar al usuario autenticado."
        );
    }
}
