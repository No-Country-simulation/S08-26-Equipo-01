import type { SystemRole } from '@/modules/auth'

export type UserProfileStatus =
  | 'PENDING_VERIFICATION'
  | 'PENDING_ACTIVATION'
  | 'ACTIVE'
  | 'SUSPENDED'

export type InternalProfileStatus = UserProfileStatus

export interface InternalProfileDto {
  id: number
  firstName: string
  lastName: string
  email: string
  status: InternalProfileStatus
  roles: SystemRole[]
  createdAt: string
  updatedAt: string
}

export type CustomerProfileRole = 'ADMIN' | 'REQUESTER' | 'VIEWER'

export interface CustomerProfileMembershipDto {
  customerId: number
  customerName: string
  role: CustomerProfileRole
  status: 'ACTIVE'
  joinedAt: string
}

export interface CustomerProfileDto {
  id: number
  firstName: string
  lastName: string
  email: string
  status: UserProfileStatus
  memberships: CustomerProfileMembershipDto[]
  createdAt: string
  updatedAt: string
}

export interface UpdateOwnProfilePayload {
  firstName: string
  lastName: string
}

export interface ChangeOwnPasswordPayload {
  currentPassword: string
  newPassword: string
}
