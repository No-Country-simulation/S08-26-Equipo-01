import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import type {
  DashboardCommercialDto,
  DashboardOverviewDto,
  DashboardPipelineDto,
} from '../types/dashboard.types'

interface DashboardHeroProps {
  overview: DashboardOverviewDto
  pipeline: DashboardPipelineDto
  commercial: DashboardCommercialDto
}

export function DashboardHero({
  overview,
  pipeline,
  commercial,
}: DashboardHeroProps) {
  const activeFlow =
    pipeline.submitted +
    pipeline.underReview +
    pipeline.waitingCustomerInfo +
    pipeline.readyForQuotation +
    pipeline.inProduction

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-[0_24px_70px_-34px_rgba(15,23,42,0.7)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute bottom-[-110px] left-[34%] h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[18%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_30%_25%,rgba(59,130,246,0.18),transparent_36%),linear-gradient(135deg,transparent_20%,rgba(255,255,255,0.035)_20%,rgba(255,255,255,0.035)_21%,transparent_21%,transparent_44%,rgba(255,255,255,0.025)_44%,rgba(255,255,255,0.025)_45%,transparent_45%)]" />
      </div>

      <div className="relative grid gap-7 px-6 py-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:px-8 lg:py-8">
        <div className="flex min-w-0 flex-col justify-center">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.85)]" />
            Centro de operación
          </div>

          <h1 className="max-w-2xl text-2xl font-bold tracking-tight text-white lg:text-[30px] lg:leading-[1.15]">
            Controla el flujo completo desde un solo lugar
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Sigue expedientes, producción, calidad y entregas con una lectura
            rápida de lo que está avanzando y lo que necesita atención.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/job-cases"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-blue-50"
            >
              <SidebarNavIcon name="cases" className="h-4 w-4 text-blue-600" />
              Ver expedientes
            </Link>
            <Link
              to="/production"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
            >
              <SidebarNavIcon
                name="production"
                className="h-4 w-4 text-slate-200"
              />
              Ir a producción
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.065] p-4 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Pulso operativo
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                Resumen del flujo actual
              </p>
            </div>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
              En línea
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/25 px-3 py-3">
              <p className="text-xl font-bold tracking-tight text-white">
                {activeFlow}
              </p>
              <p className="mt-1 text-[9px] leading-4 text-slate-400">
                En flujo
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/25 px-3 py-3">
              <p className="text-xl font-bold tracking-tight text-white">
                {overview.qualityAttention}
              </p>
              <p className="mt-1 text-[9px] leading-4 text-slate-400">
                Alertas calidad
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/25 px-3 py-3">
              <p className="text-xl font-bold tracking-tight text-white">
                {overview.readyForDelivery}
              </p>
              <p className="mt-1 text-[9px] leading-4 text-slate-400">
                Por entregar
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/25 px-3 py-2.5">
            <span className="text-[10px] text-slate-400">
              Cotizaciones en seguimiento
            </span>
            <span className="text-xs font-semibold text-white">
              {commercial.draftQuotations + commercial.sentQuotations}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
