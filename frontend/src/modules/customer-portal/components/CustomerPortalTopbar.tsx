import { useLocation } from 'react-router-dom'
import type { AuthenticatedUser } from '@/modules/auth'
import { TopbarActionIcon } from '@/shared/components/navigation/TopbarActionIcon'
import { TopbarBreadcrumb } from '@/shared/components/navigation/TopbarBreadcrumb'
import { TopbarUserMenu } from '@/shared/components/navigation/TopbarUserMenu'
import type { CustomerContextDto } from '../types/customerPortal.types'

interface CustomerPortalTopbarProps {
  customer: CustomerContextDto
  user: AuthenticatedUser
  onOpenMenu: () => void
  onLogout: () => void
}

const roleLabels = {
  ADMIN: 'Administrador',
  REQUESTER: 'Solicitante',
  VIEWER: 'Consulta',
} as const

function breadcrumb(pathname: string): string {
  if (pathname.endsWith('/members')) {
    return 'Empresa / Miembros'
  }

  if (pathname.endsWith('/company')) {
    return 'Empresa / Datos de empresa'
  }

  if (pathname.includes('/requests/new')) {
    return 'Gestión / Solicitudes / Nueva solicitud'
  }

  if (pathname.includes('/requests/')) {
    return 'Gestión / Solicitudes / Detalle'
  }

  if (pathname.endsWith('/requests')) {
    return 'Gestión / Solicitudes'
  }

  if (pathname.includes('/quotations/')) {
    return 'Gestión / Cotizaciones / Detalle'
  }

  if (pathname.endsWith('/quotations')) {
    return 'Gestión / Cotizaciones'
  }

  return 'Principal / Panel'
}

export function CustomerPortalTopbar({
  customer,
  user,
  onOpenMenu,
  onLogout,
}: CustomerPortalTopbarProps) {
  const location = useLocation()

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

      <div className="hidden min-w-0 max-w-[360px] sm:block">
        <TopbarBreadcrumb value={breadcrumb(location.pathname)} />
      </div>

      <div className="ml-auto flex shrink-0 items-center">
        <TopbarUserMenu
          email={user.email}
          roleLabel={roleLabels[customer.role]}
          accountLabel="Portal de cliente"
          detailLabel={customer.customerName}
          onLogout={onLogout}
        />
      </div>
    </header>
  )
}
