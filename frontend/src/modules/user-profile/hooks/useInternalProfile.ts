import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeOwnInternalPassword,
  getOwnInternalProfile,
  updateOwnInternalProfile,
} from '../api/userProfile.api'
import type {
  ChangeOwnPasswordPayload,
  UpdateOwnProfilePayload,
} from '../types/userProfile.types'

export const internalProfileKeys = {
  all: ['internal-profile'] as const,
  detail: () => [...internalProfileKeys.all, 'me'] as const,
}

export function useInternalProfile() {
  return useQuery({
    queryKey: internalProfileKeys.detail(),
    queryFn: getOwnInternalProfile,
  })
}

export function useInternalProfileMutations() {
  const queryClient = useQueryClient()

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateOwnProfilePayload) =>
      updateOwnInternalProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(internalProfileKeys.detail(), profile)
      void queryClient.invalidateQueries({ queryKey: ['internal-users'] })
    },
  })

  const changePassword = useMutation({
    mutationFn: (payload: ChangeOwnPasswordPayload) =>
      changeOwnInternalPassword(payload),
  })

  return { updateProfile, changePassword }
}
