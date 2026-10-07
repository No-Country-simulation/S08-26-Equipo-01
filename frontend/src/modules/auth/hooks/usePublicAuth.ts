import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acceptCustomerInvitation,
  acceptInternalInvitation,
  completeCustomerInvitation,
  registerCustomer,
  requestPasswordReset,
  resendVerification,
  resetPassword,
  resolveCustomerInvitation,
  resolveInternalInvitation,
  verifyEmail,
} from '../api/publicAuth.api'

export const publicAuthKeys = {
  all: ['public-auth'] as const,
  customerInvitation: (token: string | null) =>
    [...publicAuthKeys.all, 'customer-invitation', token] as const,
  internalInvitation: (token: string | null) =>
    [...publicAuthKeys.all, 'internal-invitation', token] as const,
}

export function useRegisterCustomer() {
  return useMutation({ mutationFn: registerCustomer })
}

export function useVerifyEmail() {
  return useMutation({ mutationFn: verifyEmail })
}

export function useResendVerification() {
  return useMutation({ mutationFn: resendVerification })
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: requestPasswordReset })
}

export function useResetPassword(token: string | null) {
  return useMutation({
    mutationFn: (password: string) => {
      if (!token) throw new Error('El enlace no contiene un token válido.')
      return resetPassword(token, password)
    },
  })
}

export function useCustomerInvitation(token: string | null) {
  return useQuery({
    queryKey: publicAuthKeys.customerInvitation(token),
    queryFn: () => {
      if (!token) throw new Error('La invitación no contiene un token válido.')
      return resolveCustomerInvitation(token)
    },
    enabled: Boolean(token),
    retry: false,
  })
}

export function useAcceptCustomerInvitation(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      if (!token) throw new Error('La invitación no contiene un token válido.')
      return acceptCustomerInvitation(token)
    },
    onSuccess: async (result) => {
      if (result.outcome === 'ACCEPTED') {
        await queryClient.invalidateQueries({ queryKey: ['customer-portal'] })
      }
    },
  })
}

export function useCompleteCustomerInvitation(token: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: {
      firstName: string
      lastName: string
      password: string
    }) => {
      if (!token) throw new Error('La invitación no contiene un token válido.')
      return completeCustomerInvitation({ token, ...values })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['customer-portal'] })
    },
  })
}

export function useInternalInvitation(token: string | null) {
  return useQuery({
    queryKey: publicAuthKeys.internalInvitation(token),
    queryFn: () => {
      if (!token) throw new Error('La invitación no contiene un token válido.')
      return resolveInternalInvitation(token)
    },
    enabled: Boolean(token),
    retry: false,
  })
}

export function useAcceptInternalInvitation(token: string | null) {
  return useMutation({
    mutationFn: (password: string) => {
      if (!token) throw new Error('La invitación no contiene un token válido.')
      return acceptInternalInvitation(token, password)
    },
  })
}
