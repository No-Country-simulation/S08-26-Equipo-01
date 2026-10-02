export const ACCOUNT_TYPES = ['CUSTOMER', 'INTERNAL'] as const
export const SYSTEM_ROLES = [
  'ADMIN',
  'COMMERCIAL',
  'ENGINEERING',
  'PRODUCTION',
  'QUALITY',
  'LOGISTICS',
  'AUDITOR',
] as const

export type AccountType = (typeof ACCOUNT_TYPES)[number]
export type SystemRole = (typeof SYSTEM_ROLES)[number]

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponseDto {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface AuthenticatedUser {
  id: string
  email: string
  accountType: AccountType
  roles: SystemRole[]
}

export interface AuthSession {
  accessToken: string
  tokenType: string
  expiresAt: number
  user: AuthenticatedUser
}
