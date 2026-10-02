import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'

interface CustomerRequestsHeaderProps {
  customerId: number
  customerName: string
  total: number
  waitingResponse: number
  inProduction: number
  canCreate: boolean
}

export function CustomerRequestsHeader({
  customerId,
  customerName,
  total,
  waitingResponse,
  inProduction,
  canCreate,
}: CustomerRequestsHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-slate-100/75 shadow-[0_12px_34px_-30px_rgba(15,23,42,0.35)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-slate-200/50 blur-3xl" />

      <div className="relative px-5 py-4 lg:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/60">
              <SidebarNavIcon name="requests" className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Gestión de trabajos
              </p>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-xl font-bold tracking-tight text-slate-950">
                  Solicitudes
                </h1>
                <p className="text-[10px] text-slate-500">
                  {customerName}
                </p>
              </div>
              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-600">
                Consulta el avance y responde cuando el equipo necesite
                información.
              </p>
            </div>
          </div>

          {canCreate ? (
            <Link
              to={`/portal/${customerId}/requests/new`}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-blue-600 px-4 text-[11px] font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 lg:self-center"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded bg-white/15 text-xs leading-none">
                +
              </span>
              Nueva solicitud
            </Link>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200/80 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-950">{total}</span>
            <span className="text-[9px] font-medium text-slate-500">
              registradas
            </span>
          </div>

          <span className="hidden h-4 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-sm font-bold text-amber-700">
              {waitingResponse}
            </span>
            <span className="text-[9px] font-medium text-slate-500">
              por responder
            </span>
          </div>

          <span className="hidden h-4 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <span className="text-sm font-bold text-indigo-700">
              {inProduction}
            </span>
            <span className="text-[9px] font-medium text-slate-500">
              en producción
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
