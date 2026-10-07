import type { CustomerMembershipRole } from '../types/customerPortal.types'

const roleLabels: Record<CustomerMembershipRole, string> = {
  ADMIN: 'Administrador',
  REQUESTER: 'Solicitante',
  VIEWER: 'Consulta',
}

export function getCustomerRoleLabel(role: CustomerMembershipRole): string {
  return roleLabels[role]
}

export function getCustomerMemberInitials(
  firstName: string,
  lastName: string,
): string {
  const first = firstName.trim().charAt(0)
  const last = lastName.trim().charAt(0)
  return `${first}${last}`.toUpperCase() || 'QT'
}

export function formatCustomerCompanyDate(value: string | null): string {
  if (!value) return 'Sin registrar'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
