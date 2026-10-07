import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  InternalUserDto,
  InternalUserInvitationDto,
  InviteInternalUserPayload,
  UpdateInternalUserRolesPayload,
  UpdateInternalUserStatusPayload,
} from '../types/internalUser.types'

export async function getInternalUsers(): Promise<InternalUserDto[]> {
  const response =
    await apiClient.get<ApiResponse<InternalUserDto[]>>('/internal/users')

  return response.data.data
}

export async function inviteInternalUser(
  payload: InviteInternalUserPayload,
): Promise<InternalUserInvitationDto> {
  const response = await apiClient.post<ApiResponse<InternalUserInvitationDto>>(
    '/internal/invitations',
    payload,
  )

  return response.data.data
}

export async function updateInternalUserRoles(
  userId: number,
  payload: UpdateInternalUserRolesPayload,
): Promise<InternalUserDto> {
  const response = await apiClient.put<ApiResponse<InternalUserDto>>(
    `/internal/users/${userId}/roles`,
    payload,
  )

  return response.data.data
}

export async function updateInternalUserStatus(
  userId: number,
  payload: UpdateInternalUserStatusPayload,
): Promise<InternalUserDto> {
  const response = await apiClient.patch<ApiResponse<InternalUserDto>>(
    `/internal/users/${userId}/status`,
    payload,
  )

  return response.data.data
}
