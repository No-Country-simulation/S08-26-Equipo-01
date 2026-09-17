import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelCustomerRequest } from '@/services/customerRequests.service'

export const useCancelCustomerRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelCustomerRequest,
    onSuccess: (cancelled) => {
      void queryClient.invalidateQueries({ queryKey: ['customer-requests'] })
      void queryClient.invalidateQueries({
        queryKey: ['customer-request', cancelled.id],
      })
    },
  })
}