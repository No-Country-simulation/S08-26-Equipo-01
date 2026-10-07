import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  AuthorizeUseAsIsPayload,
  NonConformityDto,
  ScrapResolutionDto,
  UpdateNonConformityPayload,
} from '../types/quality.types'
import type { RoutingSheetDto } from '../types/workOrder.types'

export async function updateNonConformity(
  nonConformityId: number,
  payload: UpdateNonConformityPayload,
): Promise<NonConformityDto> {
  const response = await apiClient.put<ApiResponse<NonConformityDto>>(
    `/non-conformities/${nonConformityId}`,
    payload,
  )

  return response.data.data
}

export async function createReworkRouting(
  nonConformityId: number,
): Promise<RoutingSheetDto> {
  const response = await apiClient.post<ApiResponse<RoutingSheetDto>>(
    `/non-conformities/${nonConformityId}/rework-routing`,
  )

  return response.data.data
}

export async function recordScrap(
  nonConformityId: number,
): Promise<ScrapResolutionDto> {
  const response = await apiClient.post<ApiResponse<ScrapResolutionDto>>(
    `/non-conformities/${nonConformityId}/scrap`,
  )

  return response.data.data
}

export async function authorizeUseAsIs(
  nonConformityId: number,
  payload: AuthorizeUseAsIsPayload,
): Promise<NonConformityDto> {
  const response = await apiClient.post<ApiResponse<NonConformityDto>>(
    `/non-conformities/${nonConformityId}/use-as-is`,
    payload,
  )

  return response.data.data
}
