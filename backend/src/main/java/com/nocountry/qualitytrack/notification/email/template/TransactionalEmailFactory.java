package com.nocountry.qualitytrack.notification.email.template;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.List;
import java.util.Map;

@Component
public class TransactionalEmailFactory {

    private static final String ACCOUNT_ACTION_TEMPLATE = "email/account-action";
    private static final String VERIFICATION_PATH = "/verify-email";
    private static final String PASSWORD_RESET_PATH = "/reset-password";
    private static final String CUSTOMER_INVITATION_PATH = "/customer-invitations/accept";
    private static final String INTERNAL_INVITATION_PATH = "/internal-invitations/accept";

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
                "Tu cuenta ya está creada. Solo falta confirmar que esta dirección de correo te pertenece para habilitar el acceso.",
                "Qué ocurrirá",
                List.of(
                        detail("Acción", "Verificar correo"),
                        detail("Resultado", "Activación de la cuenta"),
                        detail("Protección", "Enlace personal de un solo uso")
                ),
                "Verificar mi correo",
                "La verificación se completa dentro de QualityTrack y tu cuenta quedará disponible al terminar.",
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
                "Recibimos una solicitud para establecer una nueva contraseña. Tu acceso actual no cambia hasta que completes el proceso.",
                "Resumen de seguridad",
                List.of(
                        detail("Acción", "Cambiar contraseña"),
                        detail("Estado actual", "Tu contraseña sigue vigente"),
                        detail("Protección", "Enlace personal de un solo uso")
                ),
                "Restablecer contraseña",
                "Abre QualityTrack desde este enlace y define una nueva contraseña para tu cuenta.",
                actionUrl,
                "Si no solicitaste este cambio, ignora el correo. Tu contraseña actual permanecerá sin cambios."
        );
    }

    public EmailContent customerInvitation(String token, String customerName, String role) {
        String actionUrl = buildActionUrl(CUSTOMER_INVITATION_PATH, token);
        String roleLabel = roleLabel(role);

        return buildContent(
                "Invitación a " + customerName + " | QualityTrack",
                "Has recibido una invitación para unirte a " + customerName + " en QualityTrack.",
                "Empresa",
                "Invitación de miembro",
                "Te invitaron a formar parte de " + customerName,
                "Una empresa que trabaja en QualityTrack quiere incorporarte a su espacio de trabajo. Revisa el contexto antes de aceptar.",
                "Tu invitación",
                List.of(
                        detail("Empresa", customerName),
                        detail("Rol asignado", roleLabel),
                        detail("Acceso", customerAccessDescription(role))
                ),
                "Revisar invitación",
                "Al aceptar, usarás este correo para incorporarte. Si todavía no tienes cuenta, podrás crearla durante el proceso.",
                actionUrl,
                "Si no esperabas esta invitación, puedes ignorar el mensaje. El enlace es personal y no debes compartirlo."
        );
    }

    public EmailContent internalInvitation(String token, List<String> roles) {
        String actionUrl = buildActionUrl(INTERNAL_INVITATION_PATH, token);
        String roleLabels = roles == null || roles.isEmpty()
                ? "Sin roles asignados"
                : roles.stream()
                .map(this::roleLabel)
                .map(this::capitalize)
                .reduce((left, right) -> left + " · " + right)
                .orElse("Miembro interno");

        return buildContent(
                "Invitación al equipo interno | QualityTrack",
                "Has recibido una invitación para incorporarte al equipo interno de QualityTrack.",
                "Equipo interno",
                "Invitación de acceso",
                "Tu acceso interno está listo para activarse",
                "Un administrador preparó una cuenta interna para ti. Antes de entrar podrás revisar tus datos y establecer tu contraseña.",
                "Acceso asignado",
                List.of(
                        detail("Entorno", "Equipo interno de QualityTrack"),
                        detail("Roles", roleLabels),
                        detail("Activación", "Pendiente de crear contraseña")
                ),
                "Activar mi acceso",
                "Abre la invitación para revisar tus datos. El acceso quedará activo cuando completes la creación de tu contraseña.",
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
            String detailHeading,
            List<Map<String, String>> details,
            String actionLabel,
            String actionHint,
            String actionUrl,
            String securityMessage
    ) {
        Context context = new Context();
        context.setVariable("preheader", preheader);
        context.setVariable("category", category);
        context.setVariable("eyebrow", eyebrow);
        context.setVariable("title", title);
        context.setVariable("description", description);
        context.setVariable("detailHeading", detailHeading);
        context.setVariable("details", details);
        context.setVariable("actionLabel", actionLabel);
        context.setVariable("actionHint", actionHint);
        context.setVariable("actionUrl", actionUrl);
        context.setVariable("securityMessage", securityMessage);

        String html = templateEngine.process(ACCOUNT_ACTION_TEMPLATE, context);
        return new EmailContent(subject, html);
    }

    private Map<String, String> detail(String label, String value) {
        return Map.of("label", label, "value", value);
    }

    private String buildActionUrl(String path, String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Action token must not be blank.");
        }

        return frontendBaseUrl + path + "#token=" + token;
    }

    private String roleLabel(String role) {
        if (role == null) {
            return "miembro";
        }

        return switch (role) {
            case "ADMIN" -> "administrador";
            case "COMMERCIAL" -> "comercial";
            case "ENGINEERING" -> "ingeniería";
            case "PRODUCTION" -> "producción";
            case "QUALITY" -> "calidad";
            case "LOGISTICS" -> "logística";
            case "AUDITOR" -> "auditor";
            case "REQUESTER" -> "solicitante";
            case "VIEWER" -> "consulta";
            default -> "miembro";
        };
    }

    private String customerAccessDescription(String role) {
        if (role == null) {
            return "Acceso como miembro";
        }

        return switch (role) {
            case "ADMIN" -> "Gestión de empresa y miembros";
            case "REQUESTER" -> "Solicitudes y seguimiento";
            case "VIEWER" -> "Consulta y seguimiento";
            default -> "Acceso como miembro";
        };
    }

    private String capitalize(String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
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
