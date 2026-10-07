import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getInternalUsers,
  inviteInternalUser,
  updateInternalUserRoles,
  updateInternalUserStatus,
} from '../api/internalUsers.api'
import type {
  InviteInternalUserPayload,
  UpdateInternalUserRolesPayload,
  UpdateInternalUserStatusPayload,
} from '../types/internalUser.types'

export const internalUserKeys = {
  all: ['internal-users'] as const,
  list: () => [...internalUserKeys.all, 'list'] as const,
}

export function useInternalUsers(enabled = true) {
  return useQuery({
    queryKey: internalUserKeys.list(),
    queryFn: getInternalUsers,
    enabled,
  })
}

export function useInternalUserMutations() {
  const queryClient = useQueryClient()

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: internalUserKeys.list() })
  }

  const invite = useMutation({
    mutationFn: (payload: InviteInternalUserPayload) =>
      inviteInternalUser(payload),
    onSuccess: invalidate,
  })

  const updateRoles = useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number
      payload: UpdateInternalUserRolesPayload
    }) => updateInternalUserRoles(userId, payload),
    onSuccess: invalidate,
  })

  const updateStatus = useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number
      payload: UpdateInternalUserStatusPayload
    }) => updateInternalUserStatus(userId, payload),
    onSuccess: invalidate,
  })

  return { invite, updateRoles, updateStatus }
}
