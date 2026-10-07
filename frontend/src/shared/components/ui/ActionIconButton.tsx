import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/cn'

export type ActionIconName =
  'edit' | 'delete' | 'view' | 'download' | 'history' | 'upload'

export type ActionIconTone = 'neutral' | 'primary' | 'danger'

export interface ActionIconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> {
  icon: ActionIconName
  label: string
  tone?: ActionIconTone
  busy?: boolean
}

const toneClasses: Record<ActionIconTone, string> = {
  neutral:
    'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700',
  primary:
    'border-blue-100 bg-blue-50/70 text-blue-600 hover:border-blue-200 hover:bg-blue-100/70 hover:text-blue-700',
  danger:
    'border-red-100 bg-red-50/70 text-red-600 hover:border-red-200 hover:bg-red-100/70 hover:text-red-700',
}

export function ActionIconButton({
  icon,
  label,
  tone = 'neutral',
  busy = false,
  className,
  disabled,
  type = 'button',
  ...props
}: ActionIconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled || busy}
      className={cn(
        'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-45 sm:h-8 sm:w-8',
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {busy ? (
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-3.5 w-3.5 animate-spin"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M21 12a9 9 0 1 1-3.1-6.8" />
        </svg>
      ) : (
        <ActionIcon name={icon} />
      )}
    </button>
  )
}

function ActionIcon({ name }: { name: ActionIconName }) {
  const commonProps = {
    viewBox: '0 0 24 24',
    'aria-hidden': true,
    className: 'h-3.5 w-3.5',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  if (name === 'edit') {
    return (
      <svg {...commonProps}>
        <path d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Z" />
        <path d="m13.5 8.5 3 3" />
      </svg>
    )
  }

  if (name === 'delete') {
    return (
      <svg {...commonProps}>
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="m6 7 1 13h10l1-13" />
        <path d="M10 11v5M14 11v5" />
      </svg>
    )
  }

  if (name === 'view') {
    return (
      <svg {...commonProps}>
        <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    )
  }

  if (name === 'download') {
    return (
      <svg {...commonProps}>
        <path d="M12 3v11" />
        <path d="m8 10 4 4 4-4" />
        <path d="M5 20h14" />
      </svg>
    )
  }

  if (name === 'upload') {
    return (
      <svg {...commonProps}>
        <path d="M12 16V5" />
        <path d="m8 9 4-4 4 4" />
        <path d="M5 20h14" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}
