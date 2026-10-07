import { forwardRef, useId, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
  labelClassName?: string
}

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(function TextareaField(
  { className, id, label, error, hint, labelClassName, ...textareaProps },
  ref,
) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const describedById = error
    ? `${textareaId}-error`
    : hint
      ? `${textareaId}-hint`
      : undefined

  return (
    <div>
      <label
        htmlFor={textareaId}
        className={cn(
          'mb-2 block text-sm font-semibold text-slate-800',
          labelClassName,
        )}
      >
        {label}
      </label>

      <textarea
        ref={ref}
        id={textareaId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedById}
        className={cn(
          'min-h-28 w-full resize-y rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition',
          'placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
            : 'border-slate-300',
          className,
        )}
        {...textareaProps}
      />

      {error ? (
        <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${textareaId}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
})
