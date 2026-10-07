import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import type { SidebarNavIconName } from '@/shared/components/navigation/SidebarNavIcon'
import type { DashboardOverviewDto } from '../types/dashboard.types'

interface DashboardMetricGridProps {
  overview: DashboardOverviewDto
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

export function DashboardMetricGrid({
  overview,
}: DashboardMetricGridProps) {
  const metrics: MetricConfig[] = [
    {
      label: 'Expedientes abiertos',
      value: overview.openCases,
      detail: 'Ciclos aún no terminales',
      href: '/job-cases',
      icon: 'cases',
      iconClassName: 'text-blue-600',
      iconSurfaceClassName: 'bg-blue-50',
      accentClassName: 'from-blue-500 to-blue-400',
    },
    {
      label: 'Producción activa',
      value: overview.activeProduction,
      detail: 'Liberadas, en proceso o retrabajo',
      href: '/production',
      icon: 'production',
      iconClassName: 'text-indigo-600',
      iconSurfaceClassName: 'bg-indigo-50',
      accentClassName: 'from-indigo-500 to-violet-400',
    },
    {
      label: 'Atención de calidad',
      value: overview.qualityAttention,
      detail: 'Pendientes o detenidas por calidad',
      href: '/quality',
      icon: 'quality',
      iconClassName: 'text-amber-600',
      iconSurfaceClassName: 'bg-amber-50',
      accentClassName: 'from-amber-500 to-orange-400',
    },
    {
      label: 'Listas para entrega',
      value: overview.readyForDelivery,
      detail: 'Aprobadas y esperando logística',
      href: '/deliveries',
      icon: 'deliveries',
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
