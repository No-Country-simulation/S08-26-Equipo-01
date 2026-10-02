import type { BadgeProps } from '@/shared/components/ui/Badge'
import type {
  CustomerDeliveryDto,
  CustomerDeliveryStatus,
} from '../types/customerDelivery.types'

interface DeliveryStatusPresentation {
  label: string
  tone: BadgeProps['tone']
}

const statuses: Record<CustomerDeliveryStatus, DeliveryStatusPresentation> = {
  DISPATCHED: { label: 'En camino', tone: 'info' },
  DELIVERED: { label: 'Entregada', tone: 'success' },
  CANCELLED: { label: 'Cancelada', tone: 'danger' },
}

export interface CustomerDeliverySummary {
  dispatchedQuantity: number
  deliveredQuantity: number
  hasInTransit: boolean
  completedAgainstRequestedQuantity: boolean
  latestDelivery: CustomerDeliveryDto | null
}

export function getCustomerDeliveryStatusPresentation(
  status: CustomerDeliveryStatus,
): DeliveryStatusPresentation {
  return statuses[status]
}

export function getCustomerDeliverySummary(
  deliveries: CustomerDeliveryDto[],
  requestedQuantity: number,
): CustomerDeliverySummary {
  const active = deliveries.filter(
    (delivery) => delivery.status !== 'CANCELLED',
  )
  const dispatchedQuantity = active
    .filter((delivery) => delivery.status === 'DISPATCHED')
    .reduce((total, delivery) => total + delivery.quantity, 0)
  const deliveredQuantity = active
    .filter((delivery) => delivery.status === 'DELIVERED')
    .reduce((total, delivery) => total + delivery.quantity, 0)
  const latestDelivery =
    [...deliveries]
      .sort((left, right) => {
        const leftDate = left.deliveredAt ?? left.dispatchedAt ?? ''
        const rightDate = right.deliveredAt ?? right.dispatchedAt ?? ''
        return new Date(leftDate).getTime() - new Date(rightDate).getTime()
      })
      .at(-1) ?? null

  return {
    dispatchedQuantity,
    deliveredQuantity,
    hasInTransit: dispatchedQuantity > 0,
    completedAgainstRequestedQuantity:
      requestedQuantity > 0 && deliveredQuantity >= requestedQuantity,
    latestDelivery,
  }
}

export function formatCustomerDeliveryDateTime(value: string | null): string {
  if (!value) return 'Sin registrar'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function getCustomerDeliveryAddress(
  delivery: CustomerDeliveryDto,
): string {
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
