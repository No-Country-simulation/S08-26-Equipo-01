import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { ApiError } from '@/shared/api/ApiError'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { loginSchema, type LoginFormValues } from '../schemas/login.schema'
import { useDemoLogin } from '../hooks/useDemoLogin'
import { useLogin } from '../hooks/useLogin'
import type { AccountType } from '../types/auth.types'

interface LoginFormProps {
  onAuthenticated: (accountType: AccountType) => void
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return 'Correo o contraseña incorrectos.'
    }

    if (error.status === 403) {
      return 'Tu cuenta todavía no tiene acceso. Verifica tu correo o contacta al administrador.'
    }

    if (error.status === 404) {
      return 'La demostración todavía no está habilitada en este entorno.'
    }
  }

  return getErrorMessage(error)
}

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()
  const demoMutation = useDemoLogin()
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
    demoMutation.reset()
    const session = await loginMutation.mutateAsync(values)
    onAuthenticated(session.user.accountType)
  }

  const enterDemo = async (accountType: AccountType) => {
    loginMutation.reset()
    const session = await demoMutation.mutateAsync(accountType)
    onAuthenticated(session.user.accountType)
  }

  const pending = loginMutation.isPending || demoMutation.isPending
  const activeError = loginMutation.error ?? demoMutation.error

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

      <div>
        <TextField
          label="Contraseña"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Ingresa tu contraseña"
          labelClassName="!text-[10px] !font-semibold"
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

        <div className="mt-2 text-right">
          <Link
            to="/forgot-password"
            className="text-[9px] font-medium text-blue-600 transition hover:text-blue-700"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>

      {activeError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700"
        >
          {getLoginErrorMessage(activeError)}
        </div>
      ) : null}

      <Button
        type="submit"
        className="!h-9 w-full !rounded-lg !text-[10px] !font-semibold"
        disabled={pending}
      >
        {loginMutation.isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
      </Button>

      <div className="relative py-0.5">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Explorar demo
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-2.5">
        <p className="text-[8px] leading-3.5 text-slate-500">
          Entra con datos preparados y recorre QualityTrack desde cualquiera de
          los dos lados del proceso.
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => void enterDemo('CUSTOMER')}
            className="flex min-h-12 flex-col items-start justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-[9px] font-semibold text-slate-900">
              Demo cliente
            </span>
            <span className="mt-0.5 text-[7px] leading-3 text-slate-400">
              Industrias Nova
            </span>
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => void enterDemo('INTERNAL')}
            className="flex min-h-12 flex-col items-start justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="text-[9px] font-semibold text-slate-900">
              Demo equipo interno
            </span>
            <span className="mt-0.5 text-[7px] leading-3 text-slate-400">
              Operación completa
            </span>
          </button>
        </div>
        {demoMutation.isPending ? (
          <p className="mt-2 text-center text-[8px] font-medium text-blue-600">
            Preparando acceso de demostración…
          </p>
        ) : null}
      </div>
    </form>
  )
}
