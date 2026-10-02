import { useQuery } from '@tanstack/react-query'
import {
  getInternalCustomer,
  getInternalCustomers,
} from '../api/internalCustomers.api'

export const internalCustomerKeys = {
  all: ['internal-customers'] as const,
  list: () => [...internalCustomerKeys.all, 'list'] as const,
  detail: (customerId: number | null) =>
    [...internalCustomerKeys.all, 'detail', customerId] as const,
}

export function useInternalCustomers() {
  return useQuery({
    queryKey: internalCustomerKeys.list(),
    queryFn: getInternalCustomers,
  })
}

export function useInternalCustomer(customerId: number | null) {
  return useQuery({
    queryKey: internalCustomerKeys.detail(customerId),
    queryFn: () => getInternalCustomer(customerId as number),
    enabled: customerId !== null,
  })
}
