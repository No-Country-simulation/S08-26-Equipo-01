import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'
import type {
  DashboardCommercialDto,
  DashboardPipelineDto,
} from '../types/dashboard.types'

interface DashboardPipelineProps {
  pipeline: DashboardPipelineDto
  commercial: DashboardCommercialDto
}

export function DashboardPipeline({
  pipeline,
  commercial,
}: DashboardPipelineProps) {
  const stages = [
    { label: 'Nuevos', value: pipeline.submitted },
    { label: 'En revisión', value: pipeline.underReview },
    { label: 'Esperando cliente', value: pipeline.waitingCustomerInfo },
    { label: 'Listos para cotizar', value: pipeline.readyForQuotation },
    { label: 'Pendientes de OT', value: pipeline.awaitingWorkOrder },
    { label: 'En producción', value: pipeline.inProduction },
    { label: 'Completados', value: pipeline.completed },
  ]

  const total = stages.reduce((sum, stage) => sum + stage.value, 0)

  return (
    <Card className="overflow-hidden shadow-[0_12px_35px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm shadow-blue-200">
            {total}
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Flujo principal
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-950">
              Estado de los expedientes
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Vista rápida del avance comercial y operativo.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral" className="border border-slate-200 bg-white">
            {commercial.draftQuotations} borrador
          </Badge>
          <Badge tone="info" className="border border-blue-100 bg-blue-50/80">
            {commercial.sentQuotations} esperando cliente
          </Badge>
        </div>
      </div>

      <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-7">
        {stages.map((stage, index) => (
          <div
            key={stage.label}
            className="group relative bg-white px-4 py-5 transition hover:bg-slate-50/80"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[10px] font-bold text-blue-600">
                {index + 1}
              </span>
              {index < stages.length - 1 ? (
                <span className="hidden h-px flex-1 bg-slate-200 lg:block" />
              ) : null}
            </div>

            <div className="flex items-end justify-between gap-3">
              <p className="min-w-0 text-[10px] font-semibold leading-4 text-slate-700">
                {stage.label}
              </p>
              <span className="shrink-0 text-xl font-bold tracking-tight text-slate-950">
                {stage.value}
              </span>
            </div>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width:
                    total > 0
                      ? `${Math.max((stage.value / total) * 100, stage.value > 0 ? 12 : 0)}%`
                      : '0%',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-5 py-3">
        <p className="text-[9px] text-slate-500">
          {total} expedientes reflejados en el flujo
        </p>
        <Link
          to="/job-cases"
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Ver todos
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Card>
  )
}
