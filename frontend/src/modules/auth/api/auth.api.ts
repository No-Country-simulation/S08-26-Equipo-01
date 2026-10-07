import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import { createAuthSession } from '../model/session'
import type {
  AccountType,
  AuthSession,
  LoginCredentials,
  LoginResponseDto,
} from '../types/auth.types'

export async function authenticate(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const response = await apiClient.post<ApiResponse<LoginResponseDto>>(
    '/auth/login',
    credentials,
  )

  return createAuthSession(response.data.data)
}

export async function authenticateDemo(
  accountType: AccountType,
): Promise<AuthSession> {
  const response = await apiClient.post<ApiResponse<LoginResponseDto>>(
    '/auth/demo-login',
    { accountType },
  )

  return createAuthSession(response.data.data)
}
