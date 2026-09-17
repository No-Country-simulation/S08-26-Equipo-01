import type { CustomerRequest, CustomerRequestSummary } from './index'

export interface UseCustomerRequestsResult {
  requests: CustomerRequestSummary[]
  isLoading: boolean
  isError: boolean
  error: Error | null
  retry: () => void
}

export interface UseCustomerRequestResult {
  request: CustomerRequest | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  retry: () => void
}