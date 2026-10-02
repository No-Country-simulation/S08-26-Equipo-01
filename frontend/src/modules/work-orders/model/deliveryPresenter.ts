import type { BadgeProps } from '@/shared/components/ui/Badge'
import type { DeliveryDto, DeliveryStatus } from '../types/delivery.types'

interface StatusPresentation {
  label: string
  stage: string
  description: string
  tone: BadgeProps['tone']
}

const statusPresentation: Record<DeliveryStatus, StatusPresentation> = {
  PENDING: {
    label: 'Preparada',
    stage: 'Preparación',
    description: 'La entrega está preparada y pendiente de despacho.',
    tone: 'warning',
  },
  DISPATCHED: {
    label: 'En tránsito',
    stage: 'Traslado',
    description: 'La entrega ya salió y se encuentra en traslado al destino.',
    tone: 'info',
  },
  DELIVERED: {
    label: 'Entregada',
    stage: 'Finalizada',
    description: 'La entrega fue registrada como completada.',
    tone: 'success',
  },
  CANCELLED: {
    label: 'Cancelada',
    stage: 'Cancelada',
    description: 'Este movimiento fue cancelado y no cuenta como entrega comprometida.',
    tone: 'danger',
  },
}

export function getDeliveryStatusPresentation(
  status: DeliveryStatus,
): StatusPresentation {
  return statusPresentation[status]
}

export function formatDeliveryDateTime(value: string | null): string {
  if (!value) return 'Sin registrar'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getDeliveryAddress(delivery: DeliveryDto): string {
  return [
    delivery.destinationAddress,
    delivery.destinationCity,
    delivery.destinationState,
    delivery.destinationPostalCode,
    delivery.destinationCountry,
  ]
    .filter(Boolean)
    .join(', ')
}

export function getOpenDeliveryQuantity(deliveries: DeliveryDto[]): number {
  return deliveries
    .filter(
      (delivery) =>
        delivery.status === 'PENDING' || delivery.status === 'DISPATCHED',
    )
    .reduce((total, delivery) => total + delivery.quantity, 0)
}

export function getCommittedDeliveryQuantity(
  deliveries: DeliveryDto[],
): number {
  return deliveries
    .filter((delivery) => delivery.status !== 'CANCELLED')
    .reduce((total, delivery) => total + delivery.quantity, 0)
}

export function getDeliveredQuantity(deliveries: DeliveryDto[]): number {
  return deliveries
    .filter((delivery) => delivery.status === 'DELIVERED')
    .reduce((total, delivery) => total + delivery.quantity, 0)
}

export function getAvailableDeliveryQuantity(
  plannedQuantity: number | null,
  deliveries: DeliveryDto[],
): number {
  if (plannedQuantity === null) return 0
  return Math.max(
    plannedQuantity - getCommittedDeliveryQuantity(deliveries),
    0,
  )
}

export function isDeliveredToday(delivery: DeliveryDto): boolean {
  if (delivery.status !== 'DELIVERED' || !delivery.deliveredAt) return false

  const delivered = new Date(delivery.deliveredAt)
  const today = new Date()

  return (
    delivered.getFullYear() === today.getFullYear() &&
    delivered.getMonth() === today.getMonth() &&
    delivered.getDate() === today.getDate()
  )
}


export function formatDeliveryMethod(value: string): string {
  const knownMethods: Record<string, string> = {
    LOCAL_DELIVERY: 'Entrega local',
    CUSTOMER_PICKUP: 'Recolección del cliente',
    PICKUP: 'Recolección',
    COURIER: 'Paquetería',
    PARCEL: 'Paquetería',
  }
  const normalizedKey = value.trim().toUpperCase()

  const knownLabel = knownMethods[normalizedKey]

  if (knownLabel) return knownLabel

  const normalized = value.replace(/_/g, ' ').trim().toLowerCase()

  if (!normalized) return 'Sin método'

  return normalized.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}
