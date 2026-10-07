import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import type { CustomerContextDto } from '../types/customerPortal.types'

interface CustomerDashboardHeroProps {
  customer: CustomerContextDto
  activeRequests: number
  waitingCustomerInfo: number
  quotationsToReview: number
}

const roleLabels = {
  ADMIN: 'Administrador',
  REQUESTER: 'Solicitante',
  VIEWER: 'Consulta',
} as const

export function CustomerDashboardHero({
  customer,
  activeRequests,
  waitingCustomerInfo,
  quotationsToReview,
}: CustomerDashboardHeroProps) {
  const canCreate = customer.role !== 'VIEWER'

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-[0_24px_70px_-34px_rgba(15,23,42,0.7)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[28%] h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute inset-y-0 right-[18%] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_30%_25%,rgba(59,130,246,0.18),transparent_36%),linear-gradient(135deg,transparent_20%,rgba(255,255,255,0.035)_20%,rgba(255,255,255,0.035)_21%,transparent_21%,transparent_44%,rgba(255,255,255,0.025)_44%,rgba(255,255,255,0.025)_45%,transparent_45%)]" />
      </div>

      <div className="relative grid gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:px-7 lg:py-7">
        <div className="flex min-w-0 flex-col justify-center">
          <div className="mb-3.5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.85)]" />
            Portal de cliente
          </div>

          <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white lg:text-[28px] lg:leading-[1.15]">
            {customer.customerName}
          </h1>

          <p className="mt-2.5 max-w-2xl text-[13px] leading-6 text-slate-300">
            Consulta el avance de tus trabajos, revisa propuestas y responde
            cuando el equipo necesite una decisión de tu empresa.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {canCreate ? (
              <Link
                to={`/portal/${customer.customerId}/requests/new`}
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-4 text-[11px] font-semibold text-slate-950 shadow-sm transition hover:bg-blue-50"
              >
                <SidebarNavIcon
                  name="requests"
                  className="h-4 w-4 text-blue-600"
                />
                Nueva solicitud
              </Link>
            ) : null}

            <Link
              to={`/portal/${customer.customerId}/quotations`}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-[11px] font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
            >
              <SidebarNavIcon
                name="quotations"
                className="h-4 w-4 text-slate-200"
              />
              Ver cotizaciones
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.065] p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Estado de tu cuenta
              </p>
              <p className="mt-1 text-[13px] font-semibold text-white">
                Resumen de seguimiento
              </p>
            </div>
            <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-[9px] font-semibold text-blue-200">
              {roleLabels[customer.role]}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/25 px-3 py-2.5">
              <p className="text-[18px] font-bold tracking-tight text-white">
                {activeRequests}
              </p>
              <p className="mt-1 text-[8px] leading-4 text-slate-400">
                Trabajos activos
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/25 px-3 py-2.5">
              <p className="text-[18px] font-bold tracking-tight text-white">
                {waitingCustomerInfo}
              </p>
              <p className="mt-1 text-[8px] leading-4 text-slate-400">
                Por responder
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/25 px-3 py-2.5">
              <p className="text-[18px] font-bold tracking-tight text-white">
                {quotationsToReview}
              </p>
              <p className="mt-1 text-[8px] leading-4 text-slate-400">
                Por revisar
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/25 px-3 py-2">
            <span className="text-[9px] text-slate-400">
              Empresa conectada
            </span>
            <span className="inline-flex items-center gap-2 text-[9px] font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Activa
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
