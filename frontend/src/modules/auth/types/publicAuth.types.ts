import type { SystemRole } from './auth.types'

export type CustomerInvitationRole = 'ADMIN' | 'REQUESTER' | 'VIEWER'

export interface RegisterCustomerPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface RegisterCustomerResponseDto {
  userId: number
  email: string
  status: string
}

export interface CustomerInvitationPreviewDto {
  customerName: string
  role: CustomerInvitationRole
  expiresAt: string
}

export type CustomerInvitationAcceptOutcome =
  | 'ACCEPTED'
  | 'REGISTRATION_REQUIRED'

export interface CustomerInvitationAcceptDto {
  outcome: CustomerInvitationAcceptOutcome
  customerName: string
  role: CustomerInvitationRole
}

export interface CompleteCustomerInvitationPayload {
  token: string
  firstName: string
  lastName: string
  password: string
}

export interface InternalInvitationPreviewDto {
  firstName: string
  lastName: string
  email: string
  roles: SystemRole[]
  expiresAt: string
}

export interface InternalInvitationAcceptDto {
  userId: number
  email: string
  roles: SystemRole[]
  status: string
}
