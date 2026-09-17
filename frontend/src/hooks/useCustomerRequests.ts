import { useQuery } from '@tanstack/react-query'
import type { UseCustomerRequestsResult } from '@/features/CustomerRequests/types/hooks'
import { getCustomerRequests } from '@/services/customerRequests.service'

export const useCustomerRequests = (): UseCustomerRequestsResult => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customer-requests'],
    queryFn: getCustomerRequests,
  })

  return {
    requests: data ?? [],
    isLoading,
    isError,
    error: isError && error instanceof Error ? error : null,
    retry: () => void refetch(),
  }
}