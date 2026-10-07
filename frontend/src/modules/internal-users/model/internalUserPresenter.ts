import {
  getSystemRoleLabel,
  type SystemRole,
} from '@/modules/auth'
import type {
  InternalUserDto,
  InternalUserStatus,
} from '../types/internalUser.types'

const roleDescriptions: Record<SystemRole, string> = {
  ADMIN: 'Administra usuarios y acceso interno.',
  COMMERCIAL: 'Gestiona expedientes y cotizaciones.',
  ENGINEERING: 'Define preparación técnica y rutas.',
  PRODUCTION: 'Ejecuta operaciones y registra producción.',
  QUALITY: 'Gestiona inspecciones y no conformidades.',
  LOGISTICS: 'Gestiona despacho y entregas.',
  AUDITOR: 'Consulta trazabilidad y operación en modo lectura.',
}

export const internalRoles = [
  'ADMIN',
  'COMMERCIAL',
  'ENGINEERING',
  'PRODUCTION',
  'QUALITY',
  'LOGISTICS',
  'AUDITOR',
] as const satisfies readonly SystemRole[]

export function getInternalRoleLabel(role: SystemRole): string {
  return getSystemRoleLabel(role)
}

export function getInternalRoleDescription(role: SystemRole): string {
  return roleDescriptions[role]
}

export function getInternalUserStatusPresentation(status: InternalUserStatus): {
  label: string
  tone: 'success' | 'warning' | 'danger' | 'neutral'
} {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Activo', tone: 'success' }
    case 'SUSPENDED':
      return { label: 'Suspendido', tone: 'danger' }
    case 'PENDING_ACTIVATION':
      return { label: 'Invitación pendiente', tone: 'warning' }
    case 'PENDING_VERIFICATION':
      return { label: 'Pendiente de verificación', tone: 'warning' }
  }
}

export function getInternalUserInitials(user: InternalUserDto): string {
  return (
    [user.firstName, user.lastName]
      .map((value) => value.trim().charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'QT'
  )
}

export function formatInternalUserDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
  }).format(date)
}

export function matchesInternalUserSearch(
  user: InternalUserDto,
  search: string,
): boolean {
  const term = search.trim().toLocaleLowerCase()
  if (!term) return true

  return [
    user.firstName,
    user.lastName,
    `${user.firstName} ${user.lastName}`,
    user.email,
    ...user.roles.map(getInternalRoleLabel),
  ].some((value) => value.toLocaleLowerCase().includes(term))
}
