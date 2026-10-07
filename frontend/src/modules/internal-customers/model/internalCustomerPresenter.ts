import type { BadgeProps } from '@/shared/components/ui/Badge'
import type {
  InternalCustomerRole,
  InternalCustomerStatus,
  InternalCustomerSummaryDto,
} from '../types/internalCustomer.types'

const roleLabels: Record<InternalCustomerRole, string> = {
  ADMIN: 'Administrador',
  REQUESTER: 'Solicitante',
  VIEWER: 'Consulta',
}

export function getInternalCustomerRoleLabel(
  role: InternalCustomerRole,
): string {
  return roleLabels[role]
}

export function getInternalCustomerStatusPresentation(
  status: InternalCustomerStatus,
): { label: string; tone: BadgeProps['tone'] } {
  return status === 'ACTIVE'
    ? { label: 'Activa', tone: 'success' }
    : { label: 'Suspendida', tone: 'danger' }
}

export function getInternalCustomerLocation(
  customer: Pick<InternalCustomerSummaryDto, 'city' | 'state'>,
): string {
  return [customer.city, customer.state].filter(Boolean).join(', ') || 'Sin registrar'
}

export function getInternalCustomerContact(
  customer: Pick<
    InternalCustomerSummaryDto,
    'administrativeEmail' | 'phone'
  >,
): string {
  return customer.administrativeEmail ?? customer.phone ?? 'Sin registrar'
}

export function matchesInternalCustomerSearch(
  customer: InternalCustomerSummaryDto,
  search: string,
): boolean {
  const term = search.trim().toLocaleLowerCase('es-MX')
  if (!term) return true

  return [
    customer.name,
    customer.rfc ?? '',
    customer.administrativeEmail ?? '',
    customer.phone ?? '',
    customer.city ?? '',
    customer.state ?? '',
  ].some((value) => value.toLocaleLowerCase('es-MX').includes(term))
}

export function formatInternalCustomerDate(value: string | null): string {
  if (!value) return 'Sin registrar'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(date)
}

export function getMemberInitials(firstName: string, lastName: string): string {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`
    .toUpperCase()
    .trim() || 'QT'
}
