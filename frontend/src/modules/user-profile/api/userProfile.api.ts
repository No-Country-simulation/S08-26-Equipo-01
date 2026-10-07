import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  ChangeOwnPasswordPayload,
  CustomerProfileDto,
  InternalProfileDto,
  UpdateOwnProfilePayload,
} from '../types/userProfile.types'

export async function getOwnInternalProfile(): Promise<InternalProfileDto> {
  const response = await apiClient.get<ApiResponse<InternalProfileDto>>(
    '/internal/users/me',
  )

  return response.data.data
}

export async function updateOwnInternalProfile(
  payload: UpdateOwnProfilePayload,
): Promise<InternalProfileDto> {
  const response = await apiClient.put<ApiResponse<InternalProfileDto>>(
    '/internal/users/me',
    payload,
  )

  return response.data.data
}

export async function changeOwnInternalPassword(
  payload: ChangeOwnPasswordPayload,
): Promise<void> {
  await apiClient.put('/internal/users/me/password', payload)
}

export async function getOwnCustomerProfile(): Promise<CustomerProfileDto> {
  const response = await apiClient.get<ApiResponse<CustomerProfileDto>>(
    '/customers/me',
  )

  return response.data.data
}

export async function updateOwnCustomerProfile(
  payload: UpdateOwnProfilePayload,
): Promise<CustomerProfileDto> {
  const response = await apiClient.put<ApiResponse<CustomerProfileDto>>(
    '/customers/me',
    payload,
  )

  return response.data.data
}

export async function changeOwnCustomerPassword(
  payload: ChangeOwnPasswordPayload,
): Promise<void> {
  await apiClient.put('/customers/me/password', payload)
}
