import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'

interface CustomerCompanyHeaderProps {
  name: string
  status: string
  city: string | null
  state: string | null
  administrativeEmail: string | null
}

function formatStatus(status: string): string {
  if (status === 'ACTIVE') return 'Activa'

  return status
    .toLocaleLowerCase('es-MX')
    .replaceAll('_', ' ')
    .replace(/^./, (value) => value.toLocaleUpperCase('es-MX'))
}

export function CustomerCompanyHeader({
  name,
  status,
  city,
  state,
  administrativeEmail,
}: CustomerCompanyHeaderProps) {
  const location = [city, state].filter(Boolean).join(', ')

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-slate-100/75 shadow-[0_12px_34px_-30px_rgba(15,23,42,0.35)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-slate-200/50 blur-3xl" />

      <div className="relative px-5 py-3 lg:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-200/60">
            <SidebarNavIcon name="company" className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
              Perfil de empresa
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="truncate text-xl font-bold tracking-tight text-slate-950">
                {name}
              </h1>
              <Badge
                tone={status === 'ACTIVE' ? 'success' : 'neutral'}
                className="px-2 py-0.5 text-[8px]"
              >
                {formatStatus(status)}
              </Badge>
            </div>
            <p className="mt-0.5 max-w-2xl text-[10px] leading-4 text-slate-600">
              Información administrativa y de contacto usada dentro de QualityTrack.
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-slate-200/80 pt-2.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-[9px] font-medium text-slate-500">
              {location || 'Ubicación sin registrar'}
            </span>
          </div>

          <span className="hidden h-4 w-px bg-slate-200 sm:block" />

          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="truncate text-[9px] font-medium text-slate-500">
              {administrativeEmail || 'Correo administrativo sin registrar'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
