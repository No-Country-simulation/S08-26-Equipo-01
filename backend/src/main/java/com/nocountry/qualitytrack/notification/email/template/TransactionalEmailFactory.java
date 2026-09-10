package com.nocountry.qualitytrack.notification.email.template;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Component
public class TransactionalEmailFactory {

    private static final String ACCOUNT_ACTION_TEMPLATE = "email/account-action";
    private static final String VERIFICATION_PATH = "/verify-email";
    private static final String PASSWORD_RESET_PATH = "/reset-password";
    private static final String CUSTOMER_INVITATION_PATH = "/customer-invitations/accept";

    private final TemplateEngine templateEngine;
    private final String frontendBaseUrl;

    public TransactionalEmailFactory(
            TemplateEngine templateEngine,
            @Value("${app.frontend.base-url:http://localhost:5173}") String frontendBaseUrl
    ) {
        this.templateEngine = templateEngine;
        this.frontendBaseUrl = normalizeBaseUrl(frontendBaseUrl);
    }

    public EmailContent verification(String token) {
        String actionUrl = buildActionUrl(VERIFICATION_PATH, token);

        return buildContent(
                "Confirma tu correo | QualityTrack",
                "Verifica tu correo para activar tu cuenta de QualityTrack.",
                "Seguridad",
                "Verificación de correo",
                "Confirma tu dirección de correo",
                "Para terminar de crear tu cuenta, abre el enlace seguro de verificación.",
                "Verificar mi correo",
                "Al continuar, QualityTrack validará tu enlace y activará tu cuenta automáticamente.",
                actionUrl,
                "Si no creaste una cuenta en QualityTrack, puedes ignorar este mensaje."
        );
    }

    public EmailContent passwordReset(String token) {
        String actionUrl = buildActionUrl(PASSWORD_RESET_PATH, token);

        return buildContent(
                "Restablece tu contraseña | QualityTrack",
                "Solicitud para restablecer la contraseña de tu cuenta de QualityTrack.",
                "Seguridad",
                "Seguridad de la cuenta",
                "Restablece tu contraseña",
                "Recibimos una solicitud para cambiar la contraseña de tu cuenta. Abre el enlace seguro para continuar.",
                "Restablecer contraseña",
                "El enlace abrirá QualityTrack para que puedas elegir una nueva contraseña.",
                actionUrl,
                "Si no solicitaste este cambio, ignora el correo. Tu contraseña actual permanecerá sin cambios."
        );
    }

    public EmailContent customerInvitation(String token, String customerName, String role) {
        String actionUrl = buildActionUrl(CUSTOMER_INVITATION_PATH, token);
        String roleLabel = roleLabel(role);

        return buildContent(
                "Invitación a " + customerName + " | QualityTrack",
                "Has recibido una invitación para unirte a una empresa en QualityTrack.",
                "Empresa",
                "Invitación de miembro",
                "Únete a " + customerName,
                "Te invitaron a formar parte de esta empresa con el rol de " + roleLabel + ".",
                "Revisar invitación",
                "Abre la invitación para revisar la empresa y el rol. Al aceptar, si ya tienes cuenta quedarás incorporado; si eres nuevo, te pediremos los datos mínimos para crearla y completar la incorporación.",
                actionUrl,
                "Si no esperabas esta invitación, puedes ignorar el mensaje. El enlace es personal y no debes compartirlo."
        );
    }

    private EmailContent buildContent(
            String subject,
            String preheader,
            String category,
            String eyebrow,
            String title,
            String description,
            String actionLabel,
            String actionHint,
            String actionUrl,
            String securityMessage
    ) {
        Context context = new Context();
        context.setVariables(Map.of(
                "preheader", preheader,
                "category", category,
                "eyebrow", eyebrow,
                "title", title,
                "description", description,
                "actionLabel", actionLabel,
                "actionHint", actionHint,
                "actionUrl", actionUrl,
                "securityMessage", securityMessage
        ));

        String html = templateEngine.process(ACCOUNT_ACTION_TEMPLATE, context);
        return new EmailContent(subject, html);
    }

    private String buildActionUrl(String path, String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Action token must not be blank.");
        }

        // OpaqueTokenService generates URL-safe Base64 without padding, so the token is safe in a fragment.
        // The fragment is intentionally used instead of a query parameter so it is not sent to the frontend server
        // or included in HTTP Referer headers. The SPA reads it and sends the token to the backend in the request body.
        return frontendBaseUrl + path + "#token=" + token;
    }

    private String roleLabel(String role) {
        if (role == null) {
            return "miembro";
        }

        return switch (role) {
            case "ADMIN" -> "administrador";
            case "REQUESTER" -> "solicitante";
            case "VIEWER" -> "lector";
            default -> "miembro";
        };
    }

    private String normalizeBaseUrl(String baseUrl) {
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalStateException("FRONTEND_BASE_URL must not be blank.");
        }

        String normalized = baseUrl.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }
}
