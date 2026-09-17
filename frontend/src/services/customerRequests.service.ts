import type {
  CreateCustomerRequestInput,
  CustomerRequest,
  CustomerRequestSummary,
} from '@/features/CustomerRequests/types'
import { apiClient } from './apiClient'
import { mockApi } from './customerRequests.mock'

const USE_MOCKS = true

const CUSTOMER_REQUESTS_URL = '/customer-requests'

export const getCustomerRequests = async (): Promise<
  CustomerRequestSummary[]
> => {
  if (USE_MOCKS) {
    return mockApi.list()
  }
  const { data } = await apiClient.get<CustomerRequestSummary[]>(
    CUSTOMER_REQUESTS_URL,
  )
  return data
}

export const getCustomerRequestById = async (
  id: string,
): Promise<CustomerRequest> => {
  if (USE_MOCKS) {
    return mockApi.getById(id)
  }
  const { data } = await apiClient.get<CustomerRequest>(
    `${CUSTOMER_REQUESTS_URL}/${id}`,
  )
  return data
}

export const createCustomerRequest = async (
  input: CreateCustomerRequestInput,
): Promise<CustomerRequest> => {
  if (USE_MOCKS) {
    return mockApi.create(input)
  }
  const { data } = await apiClient.post<CustomerRequest>(
    CUSTOMER_REQUESTS_URL,
    input,
  )
  return data
}

export const cancelCustomerRequest = async (
  id: string,
): Promise<CustomerRequest> => {
  if (USE_MOCKS) {
    return mockApi.cancel(id)
  }
  const { data } = await apiClient.patch<CustomerRequest>(
    `${CUSTOMER_REQUESTS_URL}/${id}`,
    { status: 'CANCELLED' },
  )
  return data
}