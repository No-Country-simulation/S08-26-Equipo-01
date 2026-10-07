import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type { InternalDashboardDto } from '../types/dashboard.types'

export async function getInternalDashboard(): Promise<InternalDashboardDto> {
  const response = await apiClient.get<ApiResponse<InternalDashboardDto>>(
    '/internal/dashboard',
  )

  return response.data.data
}
