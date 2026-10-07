import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import type { DashboardTone } from '../types/dashboard.types'
import type { DashboardAttentionItemDto } from '../types/dashboard.types'

interface DashboardAttentionProps {
  items: DashboardAttentionItemDto[]
}

const toneSurfaceClasses: Record<DashboardTone, string> = {
  neutral: 'bg-slate-100 text-slate-600',
  info: 'bg-blue-50 text-blue-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
}

export function DashboardAttention({ items }: DashboardAttentionProps) {
  const pending = items.filter((item) => item.count > 0)
  const totalPending = pending.reduce((sum, item) => sum + item.count, 0)

  return (
    <Card className="overflow-hidden shadow-[0_12px_35px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-white to-amber-50/35 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <SidebarNavIcon name="quality" className="h-[18px] w-[18px]" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-amber-700">
              Atención requerida
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-950">
              Lo que merece una mirada
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Pendientes que pueden frenar el flujo.
            </p>
          </div>
        </div>

        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-amber-50 px-2 text-xs font-bold text-amber-700">
          {totalPending}
        </span>
      </div>

      {pending.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <SidebarNavIcon name="quality" className="h-[18px] w-[18px]" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-800">
            Todo bajo control
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            No hay pendientes operativos destacados.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {pending.map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className="group flex gap-3 px-5 py-4 transition hover:bg-slate-50/80"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneSurfaceClasses[item.tone]}`}
              >
                <span className="text-xs font-bold">{item.count}</span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold text-slate-900">
                    {item.label}
                  </p>
                  <Badge tone={item.tone} className="px-2 py-0.5 text-[9px]">
                    pendiente
                  </Badge>
                </div>
                <p className="mt-1 text-[10px] leading-5 text-slate-500">
                  {item.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center">
                <span className="rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                  Revisar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
