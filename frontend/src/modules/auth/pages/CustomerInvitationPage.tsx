import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { isSessionActive } from '../model/session'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { AuthResultPanel } from '../components/AuthResultPanel'
import { PasswordFields } from '../components/PasswordFields'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import {
  useAcceptCustomerInvitation,
  useCompleteCustomerInvitation,
  useCustomerInvitation,
} from '../hooks/usePublicAuth'
import {
  formatAccessDateTime,
  getCustomerInvitationRoleLabel,
} from '../model/publicAuthPresenter'
import { getFragmentToken } from '../model/publicToken'
import { useSessionStore } from '../store/sessionStore'
import {
  customerInvitationRegistrationSchema,
  type CustomerInvitationRegistrationFormValues,
} from '../schemas/publicAuth.schemas'
import type { CustomerInvitationPreviewDto } from '../types/publicAuth.types'

function InvitationSummary({
  invitation,
}: {
  invitation: CustomerInvitationPreviewDto
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_34px_-30px_rgba(15,23,42,0.38)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/70 px-3.5 py-3">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 21V8l8-4 8 4v13" />
              <path d="M8 21v-5h8v5" />
            </svg>
          </span>

          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Empresa que te invita
            </p>
            <h2 className="mt-0.5 truncate text-[13px] font-semibold text-slate-950">
              {invitation.customerName}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-3.5 py-3 sm:grid-cols-2">
        <div>
          <p className="text-[8px] font-medium text-slate-400">Tu rol</p>
          <p className="mt-1 text-[10px] font-semibold text-slate-700">
            {getCustomerInvitationRoleLabel(invitation.role)}
          </p>
        </div>
        <div>
          <p className="text-[8px] font-medium text-slate-400">Vigencia</p>
          <p className="mt-1 text-[9px] font-medium text-slate-600">
            Hasta {formatAccessDateTime(invitation.expiresAt)}
          </p>
        </div>
      </div>
    </section>
  )
}

export function CustomerInvitationPage() {
  const location = useLocation()
  const token = getFragmentToken(location.hash)
  const invitationQuery = useCustomerInvitation(token)
  const acceptMutation = useAcceptCustomerInvitation(token)
  const completeMutation = useCompleteCustomerInvitation(token)
  const [registrationRequired, setRegistrationRequired] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const session = useSessionStore((state) => state.session)
  const hasActiveCustomerSession =
    Boolean(session) &&
    isSessionActive(session!) &&
    session?.user.accountType === 'CUSTOMER'
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInvitationRegistrationFormValues>({
    resolver: zodResolver(customerInvitationRegistrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
  })

  if (!token) {
    return (
      <PublicAuthLayout
        eyebrow="Invitación"
        title="Enlace no válido"
        description="No encontramos la información necesaria para abrir esta invitación."
        footer={
          <Link
            className="font-semibold text-blue-600 transition hover:text-blue-700"
            to="/login"
          >
            Ir al inicio de sesión
          </Link>
        }
        immersive
      >
        <AuthResultPanel
          compact
          tone="error"
          title="Invitación incompleta"
          description="Abre nuevamente el enlace completo que recibiste por correo."
        />
      </PublicAuthLayout>
    )
  }

  if (invitationQuery.isPending) {
    return (
      <PublicAuthLayout
        eyebrow="Invitación"
        title="Revisando invitación"
        description="Estamos comprobando que el acceso siga disponible."
        immersive
      >
        <AuthResultPanel
          compact
          title="Validando enlace"
          description="Esto solo tomará un momento."
        />
      </PublicAuthLayout>
    )
  }

  if (invitationQuery.isError) {
    return (
      <PublicAuthLayout
        eyebrow="Invitación"
        title="Invitación no disponible"
        description="El enlace puede haber expirado, sido cancelado o utilizado anteriormente."
        footer={
          <Link
            className="font-semibold text-blue-600 transition hover:text-blue-700"
            to="/login"
          >
            Ir al inicio de sesión
          </Link>
        }
        immersive
      >
        <AuthResultPanel
          compact
          tone="error"
          title="No podemos abrir esta invitación"
          description={getErrorMessage(invitationQuery.error)}
        />
      </PublicAuthLayout>
    )
  }

  const invitation = invitationQuery.data

  if (accepted) {
    return (
      <PublicAuthLayout
        eyebrow="Invitación aceptada"
        title="Tu acceso está listo"
        description={`Ya formas parte de ${invitation.customerName} en QualityTrack.`}
        footer={
          <Link
            className="font-semibold text-blue-600 transition hover:text-blue-700"
            to={hasActiveCustomerSession ? '/portal' : '/login'}
          >
            {hasActiveCustomerSession ? 'Ir a mis empresas' : 'Iniciar sesión'}
          </Link>
        }
        immersive
      >
        <div className="space-y-3">
          <InvitationSummary invitation={invitation} />
          <AuthResultPanel
            compact
            tone="success"
            title="Membresía activada"
            description={hasActiveCustomerSession ? "Tu nueva empresa ya está disponible. Vuelve al portal para abrirla." : "Inicia sesión con la cuenta asociada a esta invitación para abrir el portal de la empresa."}
          />
        </div>
      </PublicAuthLayout>
    )
  }

  const accept = async () => {
    try {
      const result = await acceptMutation.mutateAsync()
      if (result.outcome === 'REGISTRATION_REQUIRED') {
        setRegistrationRequired(true)
        return
      }

      setAccepted(true)
    } catch {
      // The normalized API error is rendered below.
    }
  }

  const complete = handleSubmit(async (values) => {
    try {
      await completeMutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        password: values.password,
      })
      setAccepted(true)
    } catch {
      // The normalized API error is rendered below.
    }
  })

  return (
    <PublicAuthLayout
      eyebrow="Invitación de empresa"
      title={registrationRequired ? 'Completa tu cuenta' : 'Revisa tu invitación'}
      description={
        registrationRequired
          ? 'Tu correo ya quedó validado por la invitación. Solo faltan tus datos de acceso.'
          : `${invitation.customerName} te invitó a colaborar dentro de QualityTrack.`
      }
      footer={
        <span>
          Invitación válida hasta {formatAccessDateTime(invitation.expiresAt)}.
        </span>
      }
      wide={registrationRequired}
      immersive
    >
      {!registrationRequired ? (
        <div className="space-y-4">
          <InvitationSummary invitation={invitation} />

          <p className="text-[9px] leading-4 text-slate-500">
            Al continuar comprobaremos si ya existe una cuenta con el acceso
            invitado. Si eres nuevo, solo pediremos los datos necesarios para
            terminar el registro.
          </p>

          {acceptMutation.error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700">
              {getErrorMessage(acceptMutation.error)}
            </p>
          ) : null}

          <Button
            className="!h-9 w-full !rounded-lg !text-[10px] !font-semibold"
            disabled={acceptMutation.isPending}
            onClick={() => void accept()}
          >
            {acceptMutation.isPending ? 'Aceptando…' : 'Aceptar invitación'}
          </Button>
        </div>
      ) : (
        <form
          className="space-y-4"
          onSubmit={(event) => void complete(event)}
          noValidate
        >
          <InvitationSummary invitation={invitation} />

          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Nombre"
              autoComplete="given-name"
              labelClassName="!text-[10px] !font-semibold"
              className="!h-9 !rounded-lg !px-3 !text-[10px] !shadow-sm placeholder:!text-[9px]"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <TextField
              label="Apellido"
              autoComplete="family-name"
              labelClassName="!text-[10px] !font-semibold"
              className="!h-9 !rounded-lg !px-3 !text-[10px] !shadow-sm placeholder:!text-[9px]"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>

          <PasswordFields
            passwordRegistration={register('password')}
            confirmRegistration={register('confirmPassword')}
            passwordError={errors.password?.message}
            confirmError={errors.confirmPassword?.message}
            immersive
          />

          {completeMutation.error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700">
              {getErrorMessage(completeMutation.error)}
            </p>
          ) : null}

          <Button
            type="submit"
            className="!h-9 w-full !rounded-lg !text-[10px] !font-semibold"
            disabled={completeMutation.isPending}
          >
            {completeMutation.isPending
              ? 'Creando cuenta…'
              : 'Crear cuenta y unirme'}
          </Button>
        </form>
      )}
    </PublicAuthLayout>
  )
}
