import { useQuery } from '@tanstack/react-query'
import type { UseCustomerRequestResult } from '@/features/CustomerRequests/types/hooks'
import { getCustomerRequestById } from '@/services/customerRequests.service'

export const useCustomerRequest = (id: string): UseCustomerRequestResult => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customer-request', id],
    queryFn: () => getCustomerRequestById(id),
    enabled: Boolean(id),
  })

  return {
    request: data,
    isLoading,
    isError,
    error: isError && error instanceof Error ? error : null,
    retry: () => void refetch(),
  }
}