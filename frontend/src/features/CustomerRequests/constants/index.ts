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
}

export const STATUS_BADGE_CLASSES: Record<CustomerRequestStatus, string> = {
  RECEIVED: 'badge-info',
  UNDER_REVIEW: 'badge-warning',
  FEASIBLE: 'badge-success',
  REJECTED: 'badge-error',
  QUOTED: 'badge-primary',
}