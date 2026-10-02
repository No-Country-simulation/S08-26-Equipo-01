import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'

interface CustomerMembersHeaderProps {
  customerName: string
  total: number
  admins: number
  pendingInvitations: number | null
  isAdmin: boolean
  onInvite: () => void
}

export function CustomerMembersHeader({
  customerName,
  total,
  admins,
  pendingInvitations,
  isAdmin,
  onInvite,
}: CustomerMembersHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-slate-100/75 shadow-[0_12px_34px_-30px_rgba(15,23,42,0.35)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-slate-200/50 blur-3xl" />

      <div className="relative px-5 py-3 lg:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-200/60">
              <SidebarNavIcon name="members" className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Accesos de empresa
              </p>
              <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h1 className="text-lg font-bold tracking-tight text-slate-950 lg:text-xl">
                  Miembros
                </h1>
                <p className="truncate text-[10px] text-slate-500">
                  {customerName}
                </p>
              </div>
              <p className="mt-0.5 max-w-2xl text-[10px] leading-4 text-slate-600">
                Consulta quién puede entrar al portal y el nivel de acceso asignado.
              </p>
            </div>
          </div>

          {isAdmin ? (
            <button
              type="button"
              onClick={onInvite}
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg bg-blue-600 px-3 text-[9px] font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:self-center"
            >
              <span className="text-[13px] font-light leading-none">+</span>
              Invitar miembro
            </button>
          ) : null}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-slate-200/80 pt-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-950">{total}</span>
            <span className="text-[9px] font-medium text-slate-500">
              miembros activos
            </span>
          </div>

          <span className="hidden h-4 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-sm font-bold text-blue-700">{admins}</span>
            <span className="text-[9px] font-medium text-slate-500">
              administradores
            </span>
          </div>

          <span className="hidden h-4 w-px bg-slate-200 sm:block" />

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            <span className="text-sm font-bold text-amber-700">
              {pendingInvitations ?? '—'}
            </span>
            <span className="text-[9px] font-medium text-slate-500">
              invitaciones pendientes
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
