import { Link } from 'react-router-dom'
import { Card } from '@/shared/components/ui/Card'

interface CustomerDashboardJourneyProps {
  customerId: number
  reviewCount: number
  quotationCount: number
  productionCount: number
  completedCount: number
}

export function CustomerDashboardJourney({
  customerId,
  reviewCount,
  quotationCount,
  productionCount,
  completedCount,
}: CustomerDashboardJourneyProps) {
  const stages = [
    {
      label: 'Revisión',
      detail: 'Recibidas o validándose',
      value: reviewCount,
    },
    {
      label: 'Cotización',
      detail: 'Listas para propuesta',
      value: quotationCount,
    },
    {
      label: 'Producción',
      detail: 'En fabricación',
      value: productionCount,
    },
    {
      label: 'Completadas',
      detail: 'Trabajos finalizados',
      value: completedCount,
    },
  ]

  const total = stages.reduce((sum, stage) => sum + stage.value, 0)

  return (
    <Card className="overflow-hidden shadow-[0_12px_35px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Tus trabajos
          </p>
          <h2 className="mt-1 text-sm font-semibold text-slate-950">
            Recorrido de solicitudes
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            Una vista simple de dónde se encuentran tus trabajos.
          </p>
        </div>

        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">
          {total} solicitudes
        </span>
      </div>

      <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, index) => (
          <div
            key={stage.label}
            className="group bg-white px-5 py-5 transition hover:bg-slate-50/80"
          >
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[10px] font-bold text-blue-600">
                {index + 1}
              </span>
              {index < stages.length - 1 ? (
                <span className="hidden h-px flex-1 bg-slate-200 lg:block" />
              ) : null}
            </div>

            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold text-slate-800">
                  {stage.label}
                </p>
                <p className="mt-1 text-[9px] leading-4 text-slate-500">
                  {stage.detail}
                </p>
              </div>
              <span className="shrink-0 text-xl font-bold tracking-tight text-slate-950">
                {stage.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-5 py-3">
        <p className="text-[9px] text-slate-500">
          Seguimiento basado en tus solicitudes actuales
        </p>
        <Link
          to={`/portal/${customerId}/requests`}
          className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Ver solicitudes
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </Card>
  )
}
