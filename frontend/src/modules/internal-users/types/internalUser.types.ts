import type { SystemRole } from '@/modules/auth'

export type InternalUserStatus =
  | 'PENDING_VERIFICATION'
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'SUSPENDED'

export type InternalUserAccessStatus = 'ACTIVE' | 'SUSPENDED'

export interface InternalUserDto {
  id: number
  firstName: string
  lastName: string
  email: string
  status: InternalUserStatus
  roles: SystemRole[]
  createdAt: string
  updatedAt: string
}

export interface InternalUserInvitationDto {
  userId: number
  firstName: string
  lastName: string
  email: string
  roles: SystemRole[]
  status: InternalUserStatus
  expiresAt: string
}

export interface InviteInternalUserPayload {
  firstName: string
  lastName: string
  email: string
  roles: SystemRole[]
}

export interface UpdateInternalUserRolesPayload {
  roles: SystemRole[]
}

export interface UpdateInternalUserStatusPayload {
  status: InternalUserAccessStatus
}

export interface InternalUserFiltersValue {
  search: string
  role: SystemRole | 'ALL'
  status: InternalUserStatus | 'ALL'
}
