import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  InternalCustomerDetailDto,
  InternalCustomerSummaryDto,
} from '../types/internalCustomer.types'

export async function getInternalCustomers(): Promise<
  InternalCustomerSummaryDto[]
> {
  const response = await apiClient.get<ApiResponse<InternalCustomerSummaryDto[]>>(
    '/internal/customers',
  )

  return response.data.data
}

export async function getInternalCustomer(
  customerId: number,
): Promise<InternalCustomerDetailDto> {
  const response = await apiClient.get<ApiResponse<InternalCustomerDetailDto>>(
    `/internal/customers/${customerId}`,
  )

  return response.data.data
}
