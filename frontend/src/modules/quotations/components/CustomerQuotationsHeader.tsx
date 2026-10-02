import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'

interface CustomerQuotationsHeaderProps {
  customerName: string
  total: number
  pendingDecision: number
  adjustmentRequested: number
  approved: number
}

export function CustomerQuotationsHeader({
  customerName,
  total,
  pendingDecision,
  adjustmentRequested,
  approved,
}: CustomerQuotationsHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-slate-100/75 shadow-[0_12px_34px_-30px_rgba(15,23,42,0.35)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-slate-200/50 blur-3xl" />

      <div className="relative px-5 py-4 lg:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/60">
            <SidebarNavIcon name="quotations" className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
              Gestión comercial
            </p>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                Cotizaciones
              </h1>
              <p className="text-[10px] text-slate-500">{customerName}</p>
            </div>
            <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-600">
              Revisa las propuestas comerciales vigentes y responde cuando una cotización requiera tu decisión.
            </p>
          </div>
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
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-sm font-bold text-blue-700">
              {pendingDecision}
            </span>
            <span className="text-[9px] font-medium text-slate-500">
              por decidir
            </span>
          </div>

          <span className="hidden h-4 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-sm font-bold text-amber-700">
              {adjustmentRequested}
            </span>
            <span className="text-[9px] font-medium text-slate-500">
              en ajuste
            </span>
          </div>

          <span className="hidden h-4 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-emerald-700">
              {approved}
            </span>
            <span className="text-[9px] font-medium text-slate-500">
              aprobadas
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
