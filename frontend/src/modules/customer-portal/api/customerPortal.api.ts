import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type { CustomerContextDto } from '../types/customerPortal.types'

export async function getCustomerContexts(): Promise<CustomerContextDto[]> {
  const response =
    await apiClient.get<ApiResponse<CustomerContextDto[]>>('/customers')

  return response.data.data
}
