import { useQuery } from '@tanstack/react-query'
import { getCustomerContexts } from '../api/customerPortal.api'

export const customerPortalKeys = {
  all: ['customer-portal'] as const,
  contexts: () => [...customerPortalKeys.all, 'contexts'] as const,
}

export function useCustomerContexts() {
  return useQuery({
    queryKey: customerPortalKeys.contexts(),
    queryFn: getCustomerContexts,
  })
}
