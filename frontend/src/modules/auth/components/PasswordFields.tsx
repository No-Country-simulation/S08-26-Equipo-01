import { useState } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { TextField } from '@/shared/components/ui/TextField'

interface PasswordFieldsProps {
  passwordRegistration: UseFormRegisterReturn
  confirmRegistration: UseFormRegisterReturn
  passwordError?: string
  confirmError?: string
  passwordLabel?: string
  immersive?: boolean
}

export function PasswordFields({
  passwordRegistration,
  confirmRegistration,
  passwordError,
  confirmError,
  passwordLabel = 'Contraseña',
  immersive = false,
}: PasswordFieldsProps) {
  const [show, setShow] = useState(false)

  const labelClassName = immersive
    ? '!text-[10px] !font-semibold'
    : '!mb-1.5 !text-[10px]'
  const passwordClassName = immersive
    ? '!h-9 !rounded-lg !px-3 !pr-10 !text-[10px] !shadow-sm placeholder:!text-[9px]'
    : '!h-9 !rounded-lg !px-2.5 !pr-16 !text-[10px] !shadow-none placeholder:!text-[9px]'
  const confirmClassName = immersive
    ? '!h-9 !rounded-lg !px-3 !text-[10px] !shadow-sm placeholder:!text-[9px]'
    : '!h-9 !rounded-lg !px-2.5 !text-[10px] !shadow-none placeholder:!text-[9px]'

  return (
    <>
      <TextField
        label={passwordLabel}
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        hint="Mínimo 8 caracteres."
        labelClassName={labelClassName}
        className={passwordClassName}
        error={passwordError}
        endAdornment={
          immersive ? (
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              onClick={() => setShow((current) => !current)}
              aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
                {show ? (
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
          ) : (
            <button
              type="button"
              className="text-[8px] font-semibold text-slate-500 hover:text-slate-900"
              onClick={() => setShow((current) => !current)}
            >
              {show ? 'Ocultar' : 'Mostrar'}
            </button>
          )
        }
        {...passwordRegistration}
      />
      <TextField
        label="Confirmar contraseña"
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        labelClassName={labelClassName}
        className={confirmClassName}
        error={confirmError}
        {...confirmRegistration}
      />
    </>
  )
}
