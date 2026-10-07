import type { SystemRole } from '../types/auth.types'
import type { CustomerInvitationRole } from '../types/publicAuth.types'

const systemRoleLabels: Record<SystemRole, string> = {
  ADMIN: 'Administrador',
  COMMERCIAL: 'Comercial',
  ENGINEERING: 'Ingeniería',
  PRODUCTION: 'Producción',
  QUALITY: 'Calidad',
  LOGISTICS: 'Logística',
  AUDITOR: 'Auditoría',
}

const customerRoleLabels: Record<CustomerInvitationRole, string> = {
  ADMIN: 'Administrador',
  REQUESTER: 'Solicitante',
  VIEWER: 'Consulta',
}

export function getSystemRoleLabel(role: SystemRole): string {
  return systemRoleLabels[role]
}

export function getCustomerInvitationRoleLabel(
  role: CustomerInvitationRole,
): string {
  return customerRoleLabels[role]
}

export function formatAccessDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
