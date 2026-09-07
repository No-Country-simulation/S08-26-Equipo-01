import type { CustomerRequest } from './index'

export interface UseCustomerRequestsResult {
  requests: CustomerRequest[]
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