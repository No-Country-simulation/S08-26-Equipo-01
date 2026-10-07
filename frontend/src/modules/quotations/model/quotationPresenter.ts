import type { BadgeProps } from '@/shared/components/ui/Badge'
import type { QuotationDto, QuotationStatus } from '../types/quotation.types'

interface StatusPresentation {
  label: string
  stage: string
  description: string
  tone: BadgeProps['tone']
}

const statusPresentation: Record<QuotationStatus, StatusPresentation> = {
  DRAFT: {
    label: 'Borrador',
    stage: 'Preparación',
    description: 'Aún no se ha enviado al cliente.',
    tone: 'neutral',
  },
  ADJUSTMENT_REQUESTED: {
    label: 'Ajuste solicitado',
    stage: 'Revisión comercial',
    description: 'El cliente pidió cambios y esta revisión requiere respuesta.',
    tone: 'warning',
  },
  SENT: {
    label: 'Esperando respuesta',
    stage: 'Cliente',
    description: 'La propuesta ya fue enviada y espera la decisión del cliente.',
    tone: 'info',
  },
  APPROVED: {
    label: 'Aprobada',
    stage: 'Aprobada',
    description: 'El cliente aceptó esta revisión y el trabajo puede continuar.',
    tone: 'success',
  },
  REJECTED: {
    label: 'Rechazada',
    stage: 'Cerrada',
    description: 'El cliente rechazó esta revisión.',
    tone: 'danger',
  },
  SUPERSEDED: {
    label: 'Reemplazada',
    stage: 'Historial',
    description: 'Existe una revisión posterior que sustituye esta cotización.',
    tone: 'neutral',
  },
  EXPIRED: {
    label: 'Vencida',
    stage: 'Vencida',
    description: 'La vigencia terminó sin que esta revisión fuera aprobada.',
    tone: 'warning',
  },
  CANCELLED: {
    label: 'Cancelada',
    stage: 'Cerrada',
    description: 'La cotización fue cancelada y ya no continúa en el flujo.',
    tone: 'danger',
  },
}

export function getQuotationStatusPresentation(
  status: QuotationStatus,
): StatusPresentation {
  return statusPresentation[status]
}

export function formatQuotationMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

export function formatQuotationDate(value: string | null): string {
  if (!value) return 'Sin definir'

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(new Date(year, month - 1, day))
}

export function matchesQuotationSearch(
  quotation: QuotationDto,
  search: string,
): boolean {
  const normalized = search.trim().toLocaleLowerCase('es-MX')

  if (!normalized) return true

  return [
    quotation.quotationNumber,
    quotation.caseNumber,
    quotation.requestNumber,
    quotation.customerName,
    quotation.createdByName ?? '',
  ].some((value) => value.toLocaleLowerCase('es-MX').includes(normalized))
}
