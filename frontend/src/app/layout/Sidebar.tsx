import { Link, useLocation } from 'react-router-dom'
import {
  navigationGroups,
  type NavigationItem,
} from '@/app/layout/navigation'
import { getSystemRoleLabel, type AuthenticatedUser } from '@/modules/auth'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { cn } from '@/shared/lib/cn'

interface SidebarProps {
  open: boolean
  user: AuthenticatedUser
  onNavigate: () => void
}

function getNavigationPath(href: string): string {
  const queryIndex = href.indexOf('?')
  return queryIndex >= 0 ? href.slice(0, queryIndex) : href
}

function isNavigationItemActive(
  item: NavigationItem,
  pathname: string,
  search: string,
): boolean {
  const itemPath = getNavigationPath(item.href)
  const workOrderDetail = pathname.startsWith('/work-orders/')
  const params = new URLSearchParams(search)
  const workOrderTab = params.get('tab')

  if (item.workOrderTab) {
    return (
      pathname === itemPath ||
      (workOrderDetail && workOrderTab === item.workOrderTab)
    )
  }

  if (itemPath === '/work-orders') {
    return (
      pathname === '/work-orders' ||
      (workOrderDetail &&
        workOrderTab !== 'production' &&
        workOrderTab !== 'quality' &&
        workOrderTab !== 'delivery')
    )
  }

  if (itemPath === '/') return pathname === '/'

  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}

export function Sidebar({ open, user, onNavigate }: SidebarProps) {
  const location = useLocation()
  const primaryRole = user.roles[0]
    ? getSystemRoleLabel(user.roles[0])
    : 'Usuario interno'
  const additionalRoles = Math.max(user.roles.length - 1, 0)
  const visibleGroups = navigationGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.requiredRole || user.roles.includes(item.requiredRole),
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex h-[100dvh] max-h-[100dvh] w-[248px] flex-col overflow-hidden border-r border-slate-800 bg-slate-950 px-5 py-6 text-slate-200 transition-transform lg:sticky lg:top-0 lg:h-screen lg:max-h-screen lg:self-start lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex shrink-0 items-center gap-3 px-1">
        <img
          src="/brand/qualitytrack-mark-inverse.svg"
          alt=""
          className="h-[44px] w-[44px]"
        />
        <div className="min-w-0">
          <p className="text-base font-semibold leading-tight text-white">
            Quality<span className="text-blue-500">Track</span>
          </p>
          <p className="mt-1 text-[10px] text-slate-400">Gestión de calidad</p>
        </div>
      </div>

      <div className="mt-6 flex shrink-0 items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-3.5">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/15">
          <SidebarNavIcon name="users" className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-white">
            Equipo interno
          </p>
          <p className="mt-1 truncate text-[9px] text-slate-400">
            {primaryRole}
            {additionalRoles > 0 ? ` · +${additionalRoles}` : ''}
          </p>
        </div>
      </div>

      <nav
        className="mt-7 min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))] pr-1 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb:hover]:bg-slate-600"
        aria-label="Navegación principal"
      >
        {visibleGroups.map((group) => (
          <section key={group.label}>
            <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
              {group.label}
            </p>

            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isNavigationItemActive(
                  item,
                  location.pathname,
                  location.search,
                )

                return (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition-colors',
                        active
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/20'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white',
                      )}
                    >
                      <SidebarNavIcon
                        name={item.icon}
                        className={cn(
                          'h-[18px] w-[18px] shrink-0',
                          active ? 'text-white' : 'text-slate-400',
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  )
}
