import { useLocation } from 'react-router-dom'
import { getSystemRoleLabel, type AuthenticatedUser } from '@/modules/auth'
import { GlobalSearch } from '@/modules/global-search'
import { TopbarActionIcon } from '@/shared/components/navigation/TopbarActionIcon'
import { TopbarBreadcrumb } from '@/shared/components/navigation/TopbarBreadcrumb'
import { TopbarUserMenu } from '@/shared/components/navigation/TopbarUserMenu'

interface TopbarProps {
  user: AuthenticatedUser
  onOpenMenu: () => void
  onLogout: () => void
}

function getShiftLabel(): string {
  const hour = new Date().getHours()

  if (hour < 12) return 'Turno matutino'
  if (hour < 19) return 'Turno vespertino'
  return 'Turno nocturno'
}

function getBreadcrumb(pathname: string, search: string): string {
  if (pathname === '/production') {
    return 'Operación / Producción'
  }

  if (pathname === '/resources') {
    const tab = new URLSearchParams(search).get('tab')
    return tab === 'materials'
      ? 'Catálogos / Materiales'
      : 'Catálogos / Máquinas'
  }

  if (pathname === '/quality') {
    return 'Operación / Calidad'
  }

  if (pathname === '/deliveries') {
    return 'Operación / Entregas'
  }

  if (pathname === '/documents') {
    return 'Operación / Documentos'
  }

  if (pathname === '/internal-users') {
    return 'Administración / Usuarios internos'
  }

  if (pathname.startsWith('/customers/')) {
    return 'Comercial / Clientes / Detalle'
  }

  if (pathname === '/customers') {
    return 'Comercial / Clientes'
  }

  if (pathname.startsWith('/quotations/')) {
    return 'Comercial / Cotizaciones / Detalle'
  }

  if (pathname === '/quotations') {
    return 'Comercial / Cotizaciones'
  }

  if (pathname.startsWith('/job-cases/')) {
    return 'Comercial / Expedientes / Revisión'
  }

  if (pathname === '/job-cases') {
    return 'Comercial / Expedientes'
  }

  if (pathname.startsWith('/work-orders/')) {
    const tab = new URLSearchParams(search).get('tab')

    if (tab === 'production') {
      return 'Operación / Producción / Orden de trabajo'
    }

    if (tab === 'quality') {
      return 'Operación / Calidad / Orden de trabajo'
    }

    if (tab === 'delivery') {
      return 'Operación / Entregas / Orden de trabajo'
    }

    return 'Operación / Órdenes de trabajo / Expediente 360'
  }

  if (pathname === '/work-orders') {
    return 'Operación / Órdenes de trabajo'
  }

  return 'Principal / Panel'
}

export function Topbar({ user, onOpenMenu, onLogout }: TopbarProps) {
  const location = useLocation()
  const roleLabel =
    user.roles.length > 0
      ? user.roles.map(getSystemRoleLabel).join(' · ')
      : 'Usuario interno'
  const currentPath = getBreadcrumb(location.pathname, location.search)

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-slate-200/90 bg-white/95 px-5 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur sm:px-7">
      <button
        type="button"
        className="mr-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 lg:hidden"
        onClick={onOpenMenu}
        aria-label="Abrir navegación"
      >
        <TopbarActionIcon name="menu" />
      </button>

      <div className="hidden min-w-0 max-w-[300px] lg:block">
        <TopbarBreadcrumb value={currentPath} />
      </div>

      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end lg:ml-6">
        <GlobalSearch />
      </div>

      <div className="ml-4 flex shrink-0 items-center gap-3">
        <span className="hidden items-center gap-2 text-[10px] font-semibold text-slate-500 xl:inline-flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {getShiftLabel()}
        </span>

        <TopbarUserMenu
          email={user.email}
          roleLabel={roleLabel}
          accountLabel="Cuenta interna"
          detailLabel={getShiftLabel()}
          onLogout={onLogout}
        />
      </div>
    </header>
  )
}
