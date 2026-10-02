import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCustomerCompany } from '../api/customerCompany.api'
import { customerPortalKeys } from './useCustomerContexts'

export function useCreateCustomerCompany() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomerCompany,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: customerPortalKeys.contexts(),
      })
    },
  })
}
