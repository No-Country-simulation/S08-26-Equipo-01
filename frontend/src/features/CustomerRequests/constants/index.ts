import type { CustomerContact, CustomerRequestStatus } from '../types'

export const CURRENT_CONTACT: CustomerContact = {
  id: 'contact-c001',
  customerId: 'customer-c001',
  name: 'María Gutiérrez',
  position: 'Jefa de Compras',
  email: 'maria.gutierrez@acmeindustrial.com',
  phone: '+54 11 5555 1234',
}

export const REQUEST_STATUS_LABELS: Record<CustomerRequestStatus, string> = {
  RECEIVED: 'Recibida',
  UNDER_REVIEW: 'En revisión',
  FEASIBLE: 'Factible',
  REJECTED: 'Rechazada',
  QUOTED: 'Cotizada',
  CANCELLED: 'Cancelada',
}

export const STATUS_BADGE_CLASSES: Record<CustomerRequestStatus, string> = {
  RECEIVED: 'badge-info',
  UNDER_REVIEW: 'badge-warning',
  FEASIBLE: 'badge-success',
  REJECTED: 'badge-error',
  QUOTED: 'badge-primary',
  CANCELLED: 'badge-neutral',
}

export const CANCELLED_TOOLTIP = 'Esta solicitud ya fue cancelada'

export const UNDER_REVIEW_TOOLTIP =
  'Ya está en revisión. No se puede cancelar hasta recibir la cotización'

export const REQUEST_NOT_FOUND_MESSAGE = 'Solicitud no encontrada'

export const CANCELLATION_NOT_ALLOWED_MESSAGE =
  'La solicitud ya está en revisión y no se puede cancelar'