import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface InternalListingCardProps {
  accentClassName?: string
  children: ReactNode
  className?: string
}

interface InternalListingCardTopProps {
  icon: ReactNode
  children: ReactNode
  actions?: ReactNode
  className?: string
}

interface InternalListingSummaryGridProps {
  children: ReactNode
  columns?: 3 | 4
  className?: string
}

interface InternalListingSummaryCellProps {
  label: string
  value: ReactNode
  className?: string
}

interface InternalListingCardFooterProps {
  children: ReactNode
  className?: string
}

export function InternalListingCard({
  accentClassName = 'from-blue-500 to-cyan-400',
  children,
  className,
}: InternalListingCardProps) {
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-24px_rgba(15,23,42,0.32)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md',
        className,
      )}
    >
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r',
          accentClassName,
        )}
      />
      <div className="p-4">{children}</div>
    </article>
  )
}

export function InternalListingCardTop({
  icon,
  children,
  actions,
  className,
}: InternalListingCardTopProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 gap-3">
        {icon}
        <div className="min-w-0">{children}</div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

export function InternalListingSummaryGrid({
  children,
  columns = 3,
  className,
}: InternalListingSummaryGridProps) {
  return (
    <div
      className={cn(
        'mt-4 grid gap-2',
        columns === 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function InternalListingSummaryCell({
  label,
  value,
  className,
}: InternalListingSummaryCellProps) {
  return (
    <div
      className={cn(
        'min-w-0 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5',
        className,
      )}
    >
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500 sm:text-[8px]">
        {label}
      </p>
      <div className="mt-1 truncate text-[11px] font-semibold text-slate-900 sm:text-[10px]">
        {value}
      </div>
    </div>
  )
}

export function InternalListingCardFooter({
  children,
  className,
}: InternalListingCardFooterProps) {
  return (
    <div
      className={cn(
        'mt-4 flex flex-col gap-1 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {children}
    </div>
  )
}
