import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  CreateMaterialLotPayload,
  CreateMaterialPayload,
  MaterialDto,
  MaterialLotDto,
  RecordMaterialConsumptionPayload,
  UpsertWorkOrderMaterialPlanPayload,
  WorkOrderMaterialDto,
  WorkOrderMaterialPlanDto,
} from '../types/material.types'

export async function getMaterials(): Promise<MaterialDto[]> {
  const response = await apiClient.get<ApiResponse<MaterialDto[]>>('/materials')
  return response.data.data
}

export async function createMaterial(
  payload: CreateMaterialPayload,
): Promise<MaterialDto> {
  const response = await apiClient.post<ApiResponse<MaterialDto>>(
    '/materials',
    payload,
  )
  return response.data.data
}

export async function uploadMaterialTechnicalSheet(
  materialId: number,
  file: File,
): Promise<MaterialDto> {
  const form = new FormData()
  form.append('file', file)

  const response = await apiClient.post<ApiResponse<MaterialDto>>(
    `/materials/${materialId}/technical-sheet`,
    form,
  )
  return response.data.data
}

export async function getMaterialLots(
  materialId: number,
): Promise<MaterialLotDto[]> {
  const response = await apiClient.get<ApiResponse<MaterialLotDto[]>>(
    `/materials/${materialId}/lots`,
  )
  return response.data.data
}

export async function createMaterialLot(
  materialId: number,
  payload: CreateMaterialLotPayload,
): Promise<MaterialLotDto> {
  const response = await apiClient.post<ApiResponse<MaterialLotDto>>(
    `/materials/${materialId}/lots`,
    payload,
  )
  return response.data.data
}

export async function uploadMaterialLotCertificate(
  materialId: number,
  lotId: number,
  file: File,
): Promise<MaterialLotDto> {
  const form = new FormData()
  form.append('file', file)

  const response = await apiClient.post<ApiResponse<MaterialLotDto>>(
    `/materials/${materialId}/lots/${lotId}/certificate`,
    form,
  )
  return response.data.data
}

export async function getMaterialCertificateContent(
  documentId: number,
  versionId: number,
  download = false,
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/documents/${documentId}/versions/${versionId}/content`,
    {
      params: download ? { download: true } : undefined,
      responseType: 'blob',
    },
  )

  return response.data
}

export async function getWorkOrderMaterialPlans(
  workOrderId: number,
): Promise<WorkOrderMaterialPlanDto[]> {
  const response = await apiClient.get<ApiResponse<WorkOrderMaterialPlanDto[]>>(
    `/work-orders/${workOrderId}/material-plan`,
  )
  return response.data.data
}

export async function upsertWorkOrderMaterialPlan(
  workOrderId: number,
  payload: UpsertWorkOrderMaterialPlanPayload,
): Promise<WorkOrderMaterialPlanDto> {
  const response = await apiClient.post<ApiResponse<WorkOrderMaterialPlanDto>>(
    `/work-orders/${workOrderId}/material-plan`,
    payload,
  )
  return response.data.data
}

export async function removeWorkOrderMaterialPlan(
  workOrderId: number,
  planId: number,
): Promise<void> {
  await apiClient.delete(`/work-orders/${workOrderId}/material-plan/${planId}`)
}

export async function recordMaterialConsumption(
  workOrderId: number,
  payload: RecordMaterialConsumptionPayload,
): Promise<WorkOrderMaterialDto> {
  const response = await apiClient.post<ApiResponse<WorkOrderMaterialDto>>(
    `/work-orders/${workOrderId}/materials`,
    payload,
  )
  return response.data.data
}
