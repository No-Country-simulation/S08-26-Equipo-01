import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type { GlobalSearchResponseDto } from '../types/globalSearch.types'

export async function getGlobalSearch(
  query: string,
): Promise<GlobalSearchResponseDto> {
  const response = await apiClient.get<ApiResponse<GlobalSearchResponseDto>>(
    '/internal/search',
    { params: { q: query } },
  )

  return response.data.data
}
