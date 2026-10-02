import type { ReactNode } from 'react'

interface AuthResultPanelProps {
  title: string
  description: string
  tone?: 'success' | 'error' | 'info'
  children?: ReactNode
  compact?: boolean
}

const classes = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  error: 'border-red-200 bg-red-50 text-red-950',
  info: 'border-blue-200 bg-blue-50 text-blue-950',
} as const

export function AuthResultPanel({
  title,
  description,
  tone = 'info',
  children,
  compact = false,
}: AuthResultPanelProps) {
  return (
    <section
      className={
        compact
          ? `rounded-xl border p-3.5 ${classes[tone]}`
          : `rounded-xl border p-4 ${classes[tone]}`
      }
    >
      <p className={compact ? 'text-[10px] font-semibold' : 'text-sm font-semibold'}>
        {title}
      </p>
      <p
        className={
          compact
            ? 'mt-1 text-[9px] leading-4 opacity-80'
            : 'mt-1 text-xs leading-5 opacity-80'
        }
      >
        {description}
      </p>
      {children ? (
        <div className={compact ? 'mt-3' : 'mt-4'}>{children}</div>
      ) : null}
    </section>
  )
}
