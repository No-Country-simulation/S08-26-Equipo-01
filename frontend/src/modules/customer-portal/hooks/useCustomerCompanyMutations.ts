import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  cancelCustomerInvitation,
  createCustomerAddress,
  createCustomerInvitation,
  deleteCustomerAddress,
  removeCustomerMember,
  updateCustomerAddress,
  updateCustomerCompany,
  updateCustomerMemberRole,
} from '../api/customerCompany.api'
import type {
  CreateCustomerInvitationPayload,
  SaveCustomerAddressPayload,
  UpdateCustomerCompanyPayload,
  UpdateCustomerMemberRolePayload,
} from '../types/customerCompany.types'
import { customerCompanyKeys } from './useCustomerCompany'

export function useCustomerCompanyMutations(customerId: number) {
  const queryClient = useQueryClient()

  const updateCompany = useMutation({
    mutationFn: (payload: UpdateCustomerCompanyPayload) =>
      updateCustomerCompany(customerId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.detail(customerId),
      })
    },
  })

  const createAddress = useMutation({
    mutationFn: (payload: SaveCustomerAddressPayload) =>
      createCustomerAddress(customerId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.addresses(customerId),
      })
    },
  })

  const updateAddress = useMutation({
    mutationFn: ({
      addressId,
      payload,
    }: {
      addressId: number
      payload: SaveCustomerAddressPayload
    }) => updateCustomerAddress(customerId, addressId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.addresses(customerId),
      })
    },
  })

  const deleteAddress = useMutation({
    mutationFn: (addressId: number) =>
      deleteCustomerAddress(customerId, addressId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.addresses(customerId),
      })
    },
  })

  const invite = useMutation({
    mutationFn: (payload: CreateCustomerInvitationPayload) =>
      createCustomerInvitation(customerId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.invitations(customerId),
      })
    },
  })

  const cancelInvitation = useMutation({
    mutationFn: (invitationId: number) =>
      cancelCustomerInvitation(customerId, invitationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.invitations(customerId),
      })
    },
  })

  const updateMemberRole = useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number
      payload: UpdateCustomerMemberRolePayload
    }) => updateCustomerMemberRole(customerId, userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.members(customerId),
      })
    },
  })

  const removeMember = useMutation({
    mutationFn: (userId: number) => removeCustomerMember(customerId, userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerCompanyKeys.members(customerId),
      })
    },
  })

  return {
    updateCompany,
    createAddress,
    updateAddress,
    deleteAddress,
    invite,
    cancelInvitation,
    updateMemberRole,
    removeMember,
  }
}
