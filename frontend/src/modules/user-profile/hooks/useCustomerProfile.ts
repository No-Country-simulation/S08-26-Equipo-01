import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  changeOwnCustomerPassword,
  getOwnCustomerProfile,
  updateOwnCustomerProfile,
} from '../api/userProfile.api'
import type {
  ChangeOwnPasswordPayload,
  UpdateOwnProfilePayload,
} from '../types/userProfile.types'

export const customerProfileKeys = {
  all: ['customer-profile'] as const,
  detail: () => [...customerProfileKeys.all, 'me'] as const,
}

export function useCustomerProfile() {
  return useQuery({
    queryKey: customerProfileKeys.detail(),
    queryFn: getOwnCustomerProfile,
  })
}

export function useCustomerProfileMutations() {
  const queryClient = useQueryClient()

  const updateProfile = useMutation({
    mutationFn: (payload: UpdateOwnProfilePayload) =>
      updateOwnCustomerProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(customerProfileKeys.detail(), profile)
      void queryClient.invalidateQueries({ queryKey: ['customer-portal'] })
    },
  })

  const changePassword = useMutation({
    mutationFn: (payload: ChangeOwnPasswordPayload) =>
      changeOwnCustomerPassword(payload),
  })

  return { updateProfile, changePassword }
}
