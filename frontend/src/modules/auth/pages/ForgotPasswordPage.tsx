import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { AuthResultPanel } from '../components/AuthResultPanel'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import { useRequestPasswordReset } from '../hooks/usePublicAuth'
import {
  emailActionSchema,
  type EmailActionFormValues,
} from '../schemas/publicAuth.schemas'

export function ForgotPasswordPage() {
  const mutation = useRequestPasswordReset()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailActionFormValues>({
    resolver: zodResolver(emailActionSchema),
    defaultValues: { email: '' },
  })

  if (mutation.isSuccess) {
    return (
      <PublicAuthLayout
        eyebrow="Recuperación"
        title="Revisa tu correo"
        description="Si encontramos una cuenta activa, enviaremos un enlace para elegir una nueva contraseña."
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
        <AuthResultPanel
          compact
          tone="success"
          title="Solicitud recibida"
          description="El mensaje puede tardar unos minutos. Revisa también correo no deseado."
        />
      </PublicAuthLayout>
    )
  }

  const submit = handleSubmit((values) =>
    mutation.mutate(values.email.trim()),
  )

  return (
    <PublicAuthLayout
      eyebrow="Recuperación"
      title="Recupera tu acceso"
      description="Ingresa tu correo y te enviaremos un enlace seguro para restablecer la contraseña."
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
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tucorreo@empresa.com"
          labelClassName="!text-[10px] !font-semibold"
          className="!h-9 !rounded-lg !px-3 !text-[10px] !shadow-sm placeholder:!text-[9px]"
          error={errors.email?.message}
          {...register('email')}
        />

        {mutation.error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
          >
            {getErrorMessage(mutation.error)}
          </p>
        ) : null}

        <Button
          type="submit"
          className="!h-9 w-full !rounded-lg !text-[10px] !font-semibold"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Enviando…' : 'Enviar enlace'}
        </Button>
      </form>
    </PublicAuthLayout>
  )
}
