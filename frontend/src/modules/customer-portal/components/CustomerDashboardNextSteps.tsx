import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'

interface CustomerDashboardNextStepsProps {
  customerId: number
  waitingCustomerInfo: number
  quotationsToReview: number
  canCreate: boolean
}

export function CustomerDashboardNextSteps({
  customerId,
  waitingCustomerInfo,
  quotationsToReview,
  canCreate,
}: CustomerDashboardNextStepsProps) {
  const actions = [
    ...(waitingCustomerInfo > 0
      ? [
          {
            label: 'Información pendiente',
            description: `${waitingCustomerInfo} solicitud(es) esperan datos de tu empresa.`,
            href: `/portal/${customerId}/requests`,
            icon: 'documents' as const,
            surface: 'bg-amber-50 text-amber-600',
          },
        ]
      : []),
    ...(quotationsToReview > 0
      ? [
          {
            label: 'Cotizaciones por decidir',
            description: `${quotationsToReview} propuesta(s) están disponibles para revisión.`,
            href: `/portal/${customerId}/quotations`,
            icon: 'quotations' as const,
            surface: 'bg-blue-50 text-blue-600',
          },
        ]
      : []),
  ]

  return (
    <Card className="overflow-hidden shadow-[0_12px_35px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-white to-amber-50/35 px-5 py-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-amber-700">
            Próximos pasos
          </p>
          <h2 className="mt-1 text-sm font-semibold text-slate-950">
            Lo que necesita tu atención
          </h2>
          <p className="mt-1 text-[10px] text-slate-500">
            Decisiones y respuestas pendientes de tu lado.
          </p>
        </div>

        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-amber-50 px-2 text-xs font-bold text-amber-700">
          {actions.length}
        </span>
      </div>

      {actions.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {actions.map((action) => (
            <Link
              key={action.label}
              to={action.href}
              className="group flex gap-3 px-5 py-4 transition hover:bg-slate-50/80"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${action.surface}`}
              >
                <SidebarNavIcon
                  name={action.icon}
                  className="h-[18px] w-[18px]"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900">
                  {action.label}
                </p>
                <p className="mt-1 text-[10px] leading-5 text-slate-500">
                  {action.description}
                </p>
              </div>

              <span className="flex shrink-0 items-center text-xs font-semibold text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600">
                →
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="px-5 py-7">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <SidebarNavIcon name="quality" className="h-[18px] w-[18px]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900">
                Todo al día
              </p>
              <p className="mt-1 text-[10px] text-emerald-700">
                No tienes respuestas ni decisiones pendientes.
              </p>
            </div>
          </div>

          {canCreate ? (
            <Link
              to={`/portal/${customerId}/requests/new`}
              className="mt-4 inline-flex text-[10px] font-semibold text-blue-600 hover:text-blue-700"
            >
              ¿Nuevo trabajo? Crear solicitud →
            </Link>
          ) : null}
        </div>
      )}
    </Card>
  )
}
