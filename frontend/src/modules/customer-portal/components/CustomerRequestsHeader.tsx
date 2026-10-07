import { Link } from 'react-router-dom'
import { PortalPageHeader } from '@/shared/components/portal/PortalPageHeader'

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
    <PortalPageHeader
      icon="requests"
      eyebrow="Gestión de trabajos"
      title="Solicitudes"
      context={customerName}
      description="Consulta el avance y responde cuando el equipo necesite información."
      action={
        canCreate ? (
          <Link
            to={`/portal/${customerId}/requests/new`}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[9px] font-semibold text-white shadow-sm shadow-blue-200/70 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-white/15 text-[11px] leading-none">
              +
            </span>
            Nueva solicitud
          </Link>
        ) : null
      }
      metrics={[
        { value: total, label: 'registradas' },
        {
          value: waitingResponse,
          label: 'por responder',
          dotClassName: 'bg-amber-500',
          valueClassName: 'text-amber-700',
        },
        {
          value: inProduction,
          label: 'en producción',
          dotClassName: 'bg-indigo-500',
          valueClassName: 'text-indigo-700',
        },
      ]}
    />
  )
}
