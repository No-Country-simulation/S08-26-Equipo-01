import type { ReactNode } from 'react'
import {
  SidebarNavIcon,
  type SidebarNavIconName,
} from '@/shared/components/navigation/SidebarNavIcon'
import { cn } from '@/shared/lib/cn'

export interface PortalPageMetric {
  value: ReactNode
  label: string
  dotClassName?: string
  valueClassName?: string
}

interface PortalPageHeaderProps {
  icon: SidebarNavIconName
  eyebrow: string
  title: string
  context?: string
  description: string
  titleAdornment?: ReactNode
  action?: ReactNode
  metrics?: PortalPageMetric[]
  footer?: ReactNode
}

export function PortalPageHeader({
  icon,
  eyebrow,
  title,
  context,
  description,
  titleAdornment,
  action,
  metrics,
  footer,
}: PortalPageHeaderProps) {
  const hasFooter = Boolean(footer) || Boolean(metrics?.length)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/45 shadow-[0_12px_34px_-30px_rgba(15,23,42,0.34)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-blue-100/45 blur-3xl" />

      <div className="relative px-4 py-3.5 sm:px-5 sm:py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/60 sm:h-8 sm:w-8">
              <SidebarNavIcon
                name={icon}
                className="h-4 w-4 sm:h-3.5 sm:w-3.5"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-blue-700 sm:text-[8px] sm:text-blue-600">
                {eyebrow}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h1 className="text-[19px] font-bold tracking-tight text-slate-950 sm:text-[18px]">
                  {title}
                </h1>
                {titleAdornment}
                {context ? (
                  <span className="truncate text-[10px] font-medium text-slate-600 sm:text-[9px] sm:text-slate-500">
                    {context}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 max-w-2xl text-[10px] leading-4 text-slate-600 sm:text-[9px] sm:text-slate-500">
                {description}
              </p>
            </div>
          </div>

          {action ? (
            <div className="shrink-0 sm:self-center">{action}</div>
          ) : null}
        </div>

        {hasFooter ? (
          <div className="mt-2.5 border-t border-slate-200/80 pt-2.5">
            {footer ?? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {metrics?.map((metric, index) => (
                  <div
                    key={`${metric.label}-${index}`}
                    className="flex items-center gap-2"
                  >
                    {index > 0 ? (
                      <span className="mr-2 hidden h-3.5 w-px bg-slate-200 sm:block" />
                    ) : null}
                    {metric.dotClassName ? (
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          metric.dotClassName,
                        )}
                      />
                    ) : null}
                    <span
                      className={cn(
                        'text-[13px] font-bold tabular-nums text-slate-950',
                        metric.valueClassName,
                      )}
                    >
                      {metric.value}
                    </span>
                    <span className="text-[9px] font-medium text-slate-600 sm:text-[8px] sm:text-slate-500">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
