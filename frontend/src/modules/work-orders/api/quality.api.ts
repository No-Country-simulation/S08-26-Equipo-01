import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  QualityInspectionDto,
  QualityCheckDto,
  SaveQualityCheckPayload,
  StartQualityInspectionPayload,
} from '../types/quality.types'

export async function handoffWorkOrderToQuality(
  workOrderId: number,
): Promise<QualityInspectionDto> {
  const response = await apiClient.post<ApiResponse<QualityInspectionDto>>(
    `/work-orders/${workOrderId}/quality-handoff`,
  )

  return response.data.data
}

export async function startQualityInspection(
  inspectionId: number,
  payload: StartQualityInspectionPayload = {},
): Promise<QualityInspectionDto> {
  const response = await apiClient.post<ApiResponse<QualityInspectionDto>>(
    `/quality-inspections/${inspectionId}/start`,
    payload,
  )

  return response.data.data
}

export async function addQualityCheck(
  inspectionId: number,
  payload: SaveQualityCheckPayload,
): Promise<QualityCheckDto> {
  const response = await apiClient.post<ApiResponse<QualityCheckDto>>(
    `/quality-inspections/${inspectionId}/checks`,
    payload,
  )

  return response.data.data
}

export async function updateQualityCheck(
  inspectionId: number,
  checkId: number,
  payload: SaveQualityCheckPayload,
): Promise<QualityCheckDto> {
  const response = await apiClient.put<ApiResponse<QualityCheckDto>>(
    `/quality-inspections/${inspectionId}/checks/${checkId}`,
    payload,
  )

  return response.data.data
}

export async function completeQualityInspection(
  inspectionId: number,
): Promise<QualityInspectionDto> {
  const response = await apiClient.post<ApiResponse<QualityInspectionDto>>(
    `/quality-inspections/${inspectionId}/complete`,
  )

  return response.data.data
}
