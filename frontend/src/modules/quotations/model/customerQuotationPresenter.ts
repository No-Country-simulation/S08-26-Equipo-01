import type { BadgeProps } from '@/shared/components/ui/Badge'
import type { CustomerQuotationStatus } from '../types/customerQuotation.types'

interface CustomerStatusPresentation {
  label: string
  tone: BadgeProps['tone']
  description: string
}

const statuses: Record<CustomerQuotationStatus, CustomerStatusPresentation> = {
  SENT: {
    label: 'Cotización recibida',
    tone: 'info',
    description: 'La cotización está disponible para tu decisión.',
  },
  ADJUSTMENT_REQUESTED: {
    label: 'Ajuste solicitado',
    tone: 'warning',
    description: 'El equipo comercial está preparando una nueva revisión.',
  },
  APPROVED: {
    label: 'Aprobada',
    tone: 'success',
    description: 'La cotización fue aprobada por tu empresa.',
  },
  REJECTED: {
    label: 'Rechazada',
    tone: 'danger',
    description: 'La cotización fue rechazada por tu empresa.',
  },
  EXPIRED: {
    label: 'Vencida',
    tone: 'warning',
    description: 'La vigencia terminó y ya no admite respuesta.',
  },
  CANCELLED: {
    label: 'Cancelada',
    tone: 'danger',
    description: 'Esta revisión fue cancelada por el equipo comercial.',
  },
  REPLACED: {
    label: 'Reemplazada',
    tone: 'neutral',
    description: 'Existe una revisión posterior de esta cotización.',
  },
}

export function getCustomerQuotationStatusPresentation(
  status: CustomerQuotationStatus,
): CustomerStatusPresentation {
  return statuses[status]
}
