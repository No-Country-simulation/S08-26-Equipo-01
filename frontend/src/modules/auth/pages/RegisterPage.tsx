import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ApiError } from '@/shared/api/ApiError'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { AuthResultPanel } from '../components/AuthResultPanel'
import { PasswordFields } from '../components/PasswordFields'
import { PublicAuthLayout } from '../components/PublicAuthLayout'
import { useRegisterCustomer, useResendVerification } from '../hooks/usePublicAuth'
import {
  registerSchema,
  type RegisterFormValues,
} from '../schemas/publicAuth.schemas'

function getRegisterErrorMessage(error: unknown) {
  if (error instanceof ApiError && error.status === 409) {
    return 'Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.'
  }

  return getErrorMessage(error)
}

export function RegisterPage() {
  const registerMutation = useRegisterCustomer()
  const resendMutation = useResendVerification()
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const submit = handleSubmit(async (values) => {
    try {
      const response = await registerMutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      setRegisteredEmail(response.email)
    } catch {
      // The normalized API error is rendered below.
    }
  })

  if (registeredEmail) {
    return (
      <PublicAuthLayout
        eyebrow="Cuenta creada"
        title="Revisa tu correo"
        description="Tu cuenta está creada, pero necesitamos verificar que el correo te pertenece antes de habilitar el acceso."
        footer={
          <>
            ¿Ya verificaste tu correo?{' '}
            <Link
              className="font-semibold text-blue-600 transition hover:text-blue-700"
              to="/login"
            >
              Inicia sesión
            </Link>
          </>
        }
        immersive
      >
        <AuthResultPanel
          compact
          tone="success"
          title="Enlace de verificación enviado"
          description={`Enviamos las instrucciones a ${registeredEmail}.`}
        >
          <Button
            variant="secondary"
            className="!h-9 w-full !rounded-lg !text-[9px]"
            disabled={resendMutation.isPending || resendMutation.isSuccess}
            onClick={() => resendMutation.mutate(registeredEmail)}
          >
            {resendMutation.isPending
              ? 'Reenviando…'
              : resendMutation.isSuccess
                ? 'Correo reenviado'
                : 'Reenviar verificación'}
          </Button>
          {resendMutation.error ? (
            <p role="alert" className="mt-2.5 text-[9px] text-red-700">
              {getErrorMessage(resendMutation.error)}
            </p>
          ) : null}
        </AuthResultPanel>
      </PublicAuthLayout>
    )
  }

  return (
    <PublicAuthLayout
      eyebrow="Portal de cliente"
      title="Crea tu cuenta"
      description="Registra tu acceso personal. Después de verificar el correo podrás crear tu empresa o aceptar invitaciones."
      footer={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link className="font-semibold text-blue-600 transition hover:text-blue-700" to="/login">
            Inicia sesión
          </Link>
        </>
      }
      wide
      immersive
    >
      <form
        className="space-y-4"
        onSubmit={(event) => void submit(event)}
        noValidate
      >
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

        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          labelClassName="!text-[10px] !font-semibold"
          className="!h-9 !rounded-lg !px-3 !text-[10px] !shadow-sm placeholder:!text-[9px]"
          error={errors.email?.message}
          {...register('email')}
        />

        <PasswordFields
          passwordRegistration={register('password')}
          confirmRegistration={register('confirmPassword')}
          passwordError={errors.password?.message}
          confirmError={errors.confirmPassword?.message}
          immersive
        />

        {registerMutation.error ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
          >
            {getRegisterErrorMessage(registerMutation.error)}
          </p>
        ) : null}

        <Button
          type="submit"
          className="!h-9 w-full !rounded-lg !text-[10px] !font-semibold"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? 'Creando cuenta…' : 'Crear cuenta'}
        </Button>
      </form>
    </PublicAuthLayout>
  )
}
