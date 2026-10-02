import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'
import { useLogin } from '../hooks/useLogin'

interface LoginFormProps {
  onAuthenticated: () => void
}

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    await loginMutation.mutateAsync(values)
    onAuthenticated()
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <TextField
        label="Correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="tucorreo@empresa.com"
        labelClassName="!text-[10px] !font-semibold"
        className="!h-9 !rounded-lg !px-3 !text-[10px] !shadow-sm placeholder:!text-[9px]"
        error={errors.email?.message}
        {...register('email')}
      />

      <TextField
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="Ingresa tu contraseña"
        labelClassName="!text-[10px] !font-semibold"
        labelAction={
          <Link
            to="/forgot-password"
            className="text-[9px] font-medium text-blue-600 transition hover:text-blue-700"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        }
        className="!h-9 !rounded-lg !px-3 !pr-10 !text-[10px] !shadow-sm placeholder:!text-[9px]"
        error={errors.password?.message}
        endAdornment={
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {showPassword ? (
                <>
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.7a2 2 0 002.7 2.7" />
                  <path d="M9.9 4.2A10.7 10.7 0 0112 4c5.2 0 8.5 4.4 9.5 6a2 2 0 010 2c-.4.6-1.1 1.5-2 2.4" />
                  <path d="M6.6 6.6C4.7 7.8 3.4 9.5 2.5 11a2 2 0 000 2C3.5 14.6 6.8 19 12 19c1.4 0 2.7-.3 3.8-.7" />
                </>
              ) : (
                <>
                  <path d="M2.5 11a2 2 0 000 2c1 1.6 4.3 6 9.5 6s8.5-4.4 9.5-6a2 2 0 000-2c-1-1.6-4.3-6-9.5-6S3.5 9.4 2.5 11z" />
                  <circle cx="12" cy="12" r="2.5" />
                </>
              )}
            </svg>
          </button>
        }
        {...register('password')}
      />

      {loginMutation.isError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
        >
          {getErrorMessage(loginMutation.error)}
        </div>
      ) : null}

      <Button
        type="submit"
        className="!h-9 w-full !rounded-lg !text-[10px] !font-semibold"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Ingresando…' : 'Entrar'}
      </Button>
    </form>
  )
}
