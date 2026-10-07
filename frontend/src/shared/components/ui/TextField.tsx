import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/shared/lib/cn'

interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label: string
  error?: string
  hint?: string
  endAdornment?: ReactNode
  labelClassName?: string
  labelAction?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      className,
      id,
      label,
      error,
      hint,
      endAdornment,
      labelClassName,
      labelAction,
      ...inputProps
    },
    ref,
  ) {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const describedById = error
      ? `${inputId}-error`
      : hint
        ? `${inputId}-hint`
        : undefined

    return (
      <div>
        {labelAction ? (
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor={inputId}
              className={cn(
                'block text-sm font-semibold text-slate-800',
                labelClassName,
              )}
            >
              {label}
            </label>
            <div className="shrink-0">{labelAction}</div>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-2 block text-sm font-semibold text-slate-800',
              labelClassName,
            )}
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={describedById}
            className={cn(
              'h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition',
              'placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100',
              endAdornment ? 'pr-20' : '',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                : 'border-slate-300',
              className,
            )}
            {...inputProps}
          />
          {endAdornment ? (
            <div className="absolute inset-y-0 right-3 flex items-center">
              {endAdornment}
            </div>
          ) : null}
        </div>

        {error ? (
          <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-slate-500">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)
