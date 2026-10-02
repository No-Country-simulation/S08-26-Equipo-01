import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  CompleteCustomerInvitationPayload,
  CustomerInvitationAcceptDto,
  CustomerInvitationPreviewDto,
  InternalInvitationAcceptDto,
  InternalInvitationPreviewDto,
  RegisterCustomerPayload,
  RegisterCustomerResponseDto,
} from '../types/publicAuth.types'

export async function registerCustomer(
  payload: RegisterCustomerPayload,
): Promise<RegisterCustomerResponseDto> {
  const response = await apiClient.post<ApiResponse<RegisterCustomerResponseDto>>(
    '/auth/register',
    payload,
  )

  return response.data.data
}

export async function verifyEmail(token: string): Promise<void> {
  await apiClient.post('/auth/verify-email', { token })
}

export async function resendVerification(email: string): Promise<void> {
  await apiClient.post('/auth/resend-verification', { email })
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email })
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post('/auth/reset-password', { token, newPassword })
}

export async function resolveCustomerInvitation(
  token: string,
): Promise<CustomerInvitationPreviewDto> {
  const response = await apiClient.post<ApiResponse<CustomerInvitationPreviewDto>>(
    '/customer-invitations/resolve',
    { token },
  )

  return response.data.data
}

export async function acceptCustomerInvitation(
  token: string,
): Promise<CustomerInvitationAcceptDto> {
  const response = await apiClient.post<ApiResponse<CustomerInvitationAcceptDto>>(
    '/customer-invitations/accept',
    { token },
  )

  return response.data.data
}

export async function completeCustomerInvitation(
  payload: CompleteCustomerInvitationPayload,
): Promise<CustomerInvitationAcceptDto> {
  const response = await apiClient.post<ApiResponse<CustomerInvitationAcceptDto>>(
    '/customer-invitations/complete-registration',
    payload,
  )

  return response.data.data
}

export async function resolveInternalInvitation(
  token: string,
): Promise<InternalInvitationPreviewDto> {
  const response = await apiClient.post<ApiResponse<InternalInvitationPreviewDto>>(
    '/internal/invitations/resolve',
    { token },
  )

  return response.data.data
}

export async function acceptInternalInvitation(
  token: string,
  password: string,
): Promise<InternalInvitationAcceptDto> {
  const response = await apiClient.post<ApiResponse<InternalInvitationAcceptDto>>(
    '/internal/invitations/accept',
    { token, password },
  )

  return response.data.data
}
