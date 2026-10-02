import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import type { SidebarNavIconName } from '@/shared/components/navigation/SidebarNavIcon'

interface CustomerDashboardMetricsProps {
  customerId: number
  activeRequests: number
  waitingCustomerInfo: number
  inProduction: number
  quotationsToReview: number
}

interface MetricConfig {
  label: string
  value: number
  detail: string
  href: string
  icon: SidebarNavIconName
  iconClassName: string
  iconSurfaceClassName: string
  accentClassName: string
}

export function CustomerDashboardMetrics({
  customerId,
  activeRequests,
  waitingCustomerInfo,
  inProduction,
  quotationsToReview,
}: CustomerDashboardMetricsProps) {
  const metrics: MetricConfig[] = [
    {
      label: 'Solicitudes activas',
      value: activeRequests,
      detail: 'Trabajos que aún siguen en proceso',
      href: `/portal/${customerId}/requests`,
      icon: 'requests',
      iconClassName: 'text-blue-600',
      iconSurfaceClassName: 'bg-blue-50',
      accentClassName: 'from-blue-500 to-blue-400',
    },
    {
      label: 'Esperan tu respuesta',
      value: waitingCustomerInfo,
      detail: 'Información requerida por el equipo',
      href: `/portal/${customerId}/requests`,
      icon: 'documents',
      iconClassName: 'text-amber-600',
      iconSurfaceClassName: 'bg-amber-50',
      accentClassName: 'from-amber-500 to-orange-400',
    },
    {
      label: 'En producción',
      value: inProduction,
      detail: 'Trabajos que ya están en fabricación',
      href: `/portal/${customerId}/requests`,
      icon: 'production',
      iconClassName: 'text-indigo-600',
      iconSurfaceClassName: 'bg-indigo-50',
      accentClassName: 'from-indigo-500 to-violet-400',
    },
    {
      label: 'Cotizaciones por revisar',
      value: quotationsToReview,
      detail: 'Propuestas disponibles para tu decisión',
      href: `/portal/${customerId}/quotations`,
      icon: 'quotations',
      iconClassName: 'text-emerald-600',
      iconSurfaceClassName: 'bg-emerald-50',
      accentClassName: 'from-emerald-500 to-teal-400',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Link key={metric.label} to={metric.href} className="group min-w-0">
          <Card className="relative h-full overflow-hidden px-5 py-4 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-slate-300 group-hover:shadow-lg">
            <div
              className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${metric.accentClassName}`}
            />

            <div className="flex items-start justify-between gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${metric.iconSurfaceClassName}`}
              >
                <SidebarNavIcon
                  name={metric.icon}
                  className={`h-[18px] w-[18px] ${metric.iconClassName}`}
                />
              </div>
              <span className="text-lg font-bold leading-none text-slate-950">
                {metric.value}
              </span>
            </div>

            <p className="mt-4 text-xs font-semibold text-slate-900">
              {metric.label}
            </p>
            <p className="mt-1.5 text-[10px] leading-4 text-slate-500">
              {metric.detail}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Ver detalle
              </span>
              <span
                aria-hidden="true"
                className="text-xs font-semibold text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
              >
                →
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}
