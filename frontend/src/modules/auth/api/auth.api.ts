import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import { createAuthSession } from '../model/session'
import type {
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
