package com.nocountry.qualitytrack.shared.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Locale;

@Component
public class ProblemDetailFactory {

    public ProblemDetail create(ApiErrorCode code, String detail, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(code.getStatus(), detail);
        problem.setTitle(code.getTitle());
        problem.setType(problemType(code));
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("code", code.name());
        return problem;
    }

    private URI problemType(ApiErrorCode code) {
        String value = code.name().toLowerCase(Locale.ROOT).replace('_', '-');
        return URI.create("urn:qualitytrack:problem:" + value);
    }
}
