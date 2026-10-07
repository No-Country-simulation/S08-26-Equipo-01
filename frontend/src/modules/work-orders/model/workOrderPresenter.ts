import type { BadgeProps } from '@/shared/components/ui/Badge'
import type {
  WorkOrderDto,
  WorkOrderPriority,
  WorkOrderStatus,
} from '../types/workOrder.types'

interface StatusPresentation {
  label: string
  stage: string
  description: string
  tone: BadgeProps['tone']
}

const statusPresentation: Record<WorkOrderStatus, StatusPresentation> = {
  CREATED: {
    label: 'En preparación',
    stage: 'Preparación',
    description: 'La orden se está preparando antes de liberarla a producción.',
    tone: 'neutral',
  },
  READY_FOR_PRODUCTION: {
    label: 'Lista para producción',
    stage: 'Preparación',
    description: 'La preparación terminó y la orden ya puede iniciar operaciones.',
    tone: 'info',
  },
  IN_PRODUCTION: {
    label: 'En producción',
    stage: 'Producción',
    description: 'Hay trabajo operativo en curso para esta orden.',
    tone: 'info',
  },
  QUALITY_PENDING: {
    label: 'Pendiente de calidad',
    stage: 'Calidad',
    description: 'La producción terminó y la orden espera su inspección de calidad.',
    tone: 'warning',
  },
  QUALITY_HOLD: {
    label: 'Pausada por calidad',
    stage: 'Calidad',
    description: 'Calidad detuvo el avance hasta resolver la incidencia detectada.',
    tone: 'warning',
  },
  REWORK_IN_PROGRESS: {
    label: 'En retrabajo',
    stage: 'Producción',
    description: 'La orden está en retrabajo por una no conformidad.',
    tone: 'warning',
  },
  READY_FOR_DELIVERY: {
    label: 'Lista para entrega',
    stage: 'Entrega',
    description: 'Calidad aprobó la orden y ya puede prepararse la entrega.',
    tone: 'success',
  },
  DELIVERED: {
    label: 'Entregada',
    stage: 'Finalizada',
    description: 'La entrega ya fue registrada para esta orden.',
    tone: 'success',
  },
  CANCELLED: {
    label: 'Cancelada',
    stage: 'Cancelada',
    description: 'La orden fue cancelada y no continuará en el flujo operativo.',
    tone: 'danger',
  },
}

const priorityLabels: Record<WorkOrderPriority, string> = {
  LOW: 'Baja',
  NORMAL: 'Normal',
  HIGH: 'Alta',
  URGENT: 'Urgente',
}

export function getWorkOrderStatusPresentation(
  status: WorkOrderStatus,
): StatusPresentation {
  return statusPresentation[status]
}

export function getWorkOrderPriorityLabel(priority: WorkOrderPriority): string {
  return priorityLabels[priority]
}

export function formatWorkOrderDate(value: string | null): string {
  if (!value) return 'Sin definir'

  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) return value

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export function matchesWorkOrderSearch(
  workOrder: WorkOrderDto,
  search: string,
): boolean {
  const normalized = search.trim().toLocaleLowerCase('es-MX')

  if (!normalized) return true

  return [
    workOrder.workOrderNumber,
    workOrder.caseNumber,
    workOrder.requestNumber,
    workOrder.customerName,
    workOrder.approvedQuotationNumber,
  ].some((value) => value.toLocaleLowerCase('es-MX').includes(normalized))
}
