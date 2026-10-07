import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { AuthResultPanel } from '../components/AuthResultPanel'
import { PasswordFields } from '../components/PasswordFields'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import {
  useAcceptInternalInvitation,
  useInternalInvitation,
} from '../hooks/usePublicAuth'
import {
  formatAccessDateTime,
  getSystemRoleLabel,
} from '../model/publicAuthPresenter'
import { getFragmentToken } from '../model/publicToken'
import {
  internalInvitationActivationSchema,
  type InternalInvitationActivationFormValues,
} from '../schemas/publicAuth.schemas'

export function InternalInvitationPage() {
  const location = useLocation()
  const token = getFragmentToken(location.hash)
  const invitationQuery = useInternalInvitation(token)
  const acceptMutation = useAcceptInternalInvitation(token)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InternalInvitationActivationFormValues>({
    resolver: zodResolver(internalInvitationActivationSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  if (!token) {
    return (
      <PublicAuthLayout
        eyebrow="Equipo interno"
        title="Enlace no válido"
        description="La invitación no contiene el token necesario para activar la cuenta."
        footer={
          <Link className="font-semibold text-blue-600" to="/login">
            Ir al inicio de sesión
          </Link>
        }
      >
        <AuthResultPanel
          tone="error"
          title="Invitación incompleta"
          description="Abre nuevamente el enlace completo recibido por correo."
        />
      </PublicAuthLayout>
    )
  }

  if (invitationQuery.isPending) {
    return (
      <PublicAuthLayout
        eyebrow="Equipo interno"
        title="Revisando invitación"
        description="Estamos comprobando que el acceso siga disponible."
      >
        <LoadingState label="Validando invitación…" />
      </PublicAuthLayout>
    )
  }

  if (invitationQuery.isError) {
    return (
      <PublicAuthLayout
        eyebrow="Equipo interno"
        title="Invitación no disponible"
        description="El enlace puede haber expirado, ya haberse utilizado o no ser válido."
        footer={
          <Link className="font-semibold text-blue-600" to="/login">
            Ir al inicio de sesión
          </Link>
        }
      >
        <AuthResultPanel
          tone="error"
          title="No podemos activar este acceso"
          description={getErrorMessage(invitationQuery.error)}
        />
      </PublicAuthLayout>
    )
  }

  if (acceptMutation.isSuccess) {
    return (
      <PublicAuthLayout
        eyebrow="Equipo interno"
        title="Cuenta activada"
        description="Tu acceso interno está listo y los roles asignados ya forman parte de tu cuenta."
        footer={
          <Link className="font-semibold text-blue-600" to="/login">
            Iniciar sesión
          </Link>
        }
      >
        <AuthResultPanel
          tone="success"
          title="Activación completada"
          description="Usa el correo de la invitación y la contraseña que acabas de definir."
        />
      </PublicAuthLayout>
    )
  }

  const invitation = invitationQuery.data
  const submit = handleSubmit((values) =>
    acceptMutation.mutate(values.password),
  )

  return (
    <PublicAuthLayout
      eyebrow="Equipo interno"
      title={`${invitation.firstName}, activa tu acceso`}
      description={`La cuenta ${invitation.email} fue invitada al equipo interno de QualityTrack.`}
      footer={
        <span>
          Invitación válida hasta {formatAccessDateTime(invitation.expiresAt)}.
        </span>
      }
    >
      <div className="mb-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Roles asignados
        </p>
        <div className="flex flex-wrap gap-2">
          {invitation.roles.map((role) => (
            <Badge key={role} tone="info">
              {getSystemRoleLabel(role)}
            </Badge>
          ))}
        </div>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => void submit(event)}
        noValidate
      >
        <PasswordFields
          passwordRegistration={register('password')}
          confirmRegistration={register('confirmPassword')}
          passwordError={errors.password?.message}
          confirmError={errors.confirmPassword?.message}
        />

        {acceptMutation.error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {getErrorMessage(acceptMutation.error)}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={acceptMutation.isPending}
        >
          {acceptMutation.isPending ? 'Activando…' : 'Activar cuenta'}
        </Button>
      </form>
    </PublicAuthLayout>
  )
}
