import { useQuery } from '@tanstack/react-query'
import {
  getInternalCustomer,
  getInternalCustomerJobCases,
  getInternalCustomers,
} from '../api/internalCustomers.api'
import type { InternalCustomerJobCaseQuery } from '../types/internalCustomer.types'

export const internalCustomerKeys = {
  all: ['internal-customers'] as const,
  list: () => [...internalCustomerKeys.all, 'list'] as const,
  detail: (customerId: number | null) =>
    [...internalCustomerKeys.all, 'detail', customerId] as const,
  jobCases: (customerId: number, query: InternalCustomerJobCaseQuery) =>
    [...internalCustomerKeys.all, 'job-cases', customerId, query] as const,
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

export function useInternalCustomerJobCases(
  customerId: number,
  query: InternalCustomerJobCaseQuery,
) {
  return useQuery({
    queryKey: internalCustomerKeys.jobCases(customerId, query),
    queryFn: () => getInternalCustomerJobCases(customerId, query),
    placeholderData: (previousData) => previousData,
  })
}
