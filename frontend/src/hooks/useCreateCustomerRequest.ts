import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCustomerRequest } from '@/services/customerRequests.service'

export const useCreateCustomerRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomerRequest,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer-requests'] })
    },
  })
}