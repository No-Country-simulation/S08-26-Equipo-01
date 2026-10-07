import { Link, NavLink } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import type { SidebarNavIconName } from '@/shared/components/navigation/SidebarNavIcon'
import { cn } from '@/shared/lib/cn'
import type { CustomerContextDto } from '../types/customerPortal.types'

interface CustomerPortalSidebarProps {
  customer: CustomerContextDto
  hasMultipleCustomers: boolean
  open: boolean
  onNavigate: () => void
}

interface CustomerNavigationItem {
  label: string
  href: string
  icon: SidebarNavIconName
  end?: boolean
}

interface CustomerNavigationGroup {
  label: string
  items: CustomerNavigationItem[]
}

const roleLabels = {
  ADMIN: 'Administrador',
  REQUESTER: 'Solicitante',
  VIEWER: 'Consulta',
} as const

export function CustomerPortalSidebar({
  customer,
  hasMultipleCustomers,
  open,
  onNavigate,
}: CustomerPortalSidebarProps) {
  const base = `/portal/${customer.customerId}`
  const groups: CustomerNavigationGroup[] = [
    {
      label: 'Principal',
      items: [{ label: 'Panel', href: base, icon: 'panel', end: true }],
    },
    {
      label: 'Gestión',
      items: [
        {
          label: 'Solicitudes',
          href: `${base}/requests`,
          icon: 'requests',
        },
        {
          label: 'Cotizaciones',
          href: `${base}/quotations`,
          icon: 'quotations',
        },
      ],
    },
    {
      label: 'Empresa',
      items: [
        { label: 'Miembros', href: `${base}/members`, icon: 'members' },
        { label: 'Datos de empresa', href: `${base}/company`, icon: 'company' },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-screen max-h-screen w-[248px] flex-col overflow-y-auto border-r border-slate-800 bg-slate-950 px-5 py-6 text-slate-200 transition-transform lg:sticky lg:top-0 lg:self-start lg:overflow-hidden lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex items-center gap-3 px-1">
        <img
          src="/brand/qualitytrack-mark-inverse.svg"
          alt=""
          className="h-[44px] w-[44px]"
        />
        <div className="min-w-0">
          <p className="text-base font-semibold leading-tight text-white">
            Quality<span className="text-blue-500">Track</span>
          </p>
          <p className="mt-1 text-[10px] text-slate-400">Portal de cliente</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-3.5">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/15">
          <SidebarNavIcon name="company" className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-white">
            {customer.customerName}
          </p>
          <p className="mt-1 text-[9px] text-slate-400">
            {roleLabels[customer.role]}
          </p>
          {hasMultipleCustomers ? (
            <Link
              to="/portal"
              onClick={onNavigate}
              className="mt-2 inline-flex text-[10px] font-semibold text-blue-300 transition hover:text-white"
            >
              Cambiar empresa
            </Link>
          ) : null}
        </div>
      </div>

      <nav
        className="mt-7 space-y-6 pb-5 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-1 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb:hover]:bg-slate-600"
        aria-label="Navegación del portal de cliente"
      >
        {groups.map((group) => (
          <section key={group.label}>
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {group.label}
            </p>

            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.label}>
                  <NavLink
                    to={item.href}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors',
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/20'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <SidebarNavIcon
                          name={item.icon}
                          className={cn(
                            'h-[18px] w-[18px] shrink-0',
                            isActive ? 'text-white' : 'text-slate-400',
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  )
}
