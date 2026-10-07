import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { AuthResultPanel } from '../components/AuthResultPanel'
import { PasswordFields } from '../components/PasswordFields'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import { useResetPassword } from '../hooks/usePublicAuth'
import { getFragmentToken } from '../model/publicToken'
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../schemas/publicAuth.schemas'

export function ResetPasswordPage() {
  const location = useLocation()
  const token = getFragmentToken(location.hash)
  const mutation = useResetPassword(token)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  if (!token) {
    return (
      <PublicAuthLayout
        eyebrow="Recuperación"
        title="Enlace no válido"
        description="No encontramos la información necesaria para restablecer tu contraseña."
        footer={
          <Link
            className="font-semibold text-blue-600 transition hover:text-blue-700"
            to="/forgot-password"
          >
            Solicitar otro enlace
          </Link>
        }
        immersive
      >
        <AuthResultPanel
          compact
          tone="error"
          title="Falta información"
          description="Abre nuevamente el enlace completo que recibiste por correo."
        />
      </PublicAuthLayout>
    )
  }

  if (mutation.isSuccess) {
    return (
      <PublicAuthLayout
        eyebrow="Recuperación"
        title="Contraseña actualizada"
        description="Tu acceso ya está listo con la nueva contraseña."
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
          tone="success"
          title="Cambio completado"
          description="El enlace de recuperación ya fue consumido y no puede volver a utilizarse."
        />
      </PublicAuthLayout>
    )
  }

  const submit = handleSubmit((values) => mutation.mutate(values.password))

  return (
    <PublicAuthLayout
      eyebrow="Recuperación"
      title="Define una nueva contraseña"
      description="Elige una contraseña nueva para recuperar el acceso a tu cuenta."
      footer={
        <Link
          className="font-semibold text-blue-600 transition hover:text-blue-700"
          to="/login"
        >
          Volver al inicio de sesión
        </Link>
      }
      immersive
    >
      <form
        className="space-y-4"
        onSubmit={(event) => void submit(event)}
        noValidate
      >
        <PasswordFields
          passwordRegistration={register('password')}
          confirmRegistration={register('confirmPassword')}
          passwordError={errors.password?.message}
          confirmError={errors.confirmPassword?.message}
          passwordLabel="Nueva contraseña"
          immersive
        />

        {mutation.error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700">
            {getErrorMessage(mutation.error)}
          </p>
        ) : null}

        <Button
          type="submit"
          className="!h-9 w-full !rounded-lg !text-[10px] !font-semibold"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Actualizando…' : 'Guardar contraseña'}
        </Button>
      </form>
    </PublicAuthLayout>
  )
}
