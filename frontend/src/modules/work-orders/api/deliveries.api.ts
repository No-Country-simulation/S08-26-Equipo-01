import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  AttachDeliveryEvidencePayload,
  CancelDeliveryPayload,
  CompleteDeliveryPayload,
  CreateDeliveryPayload,
  DeliveryDto,
  DispatchDeliveryPayload,
} from '../types/delivery.types'

export async function getDeliveries(): Promise<DeliveryDto[]> {
  const response =
    await apiClient.get<ApiResponse<DeliveryDto[]>>('/deliveries')
  return response.data.data
}

export async function createDelivery(
  workOrderId: number,
  payload: CreateDeliveryPayload,
): Promise<DeliveryDto> {
  const response = await apiClient.post<ApiResponse<DeliveryDto>>(
    `/work-orders/${workOrderId}/deliveries`,
    payload,
  )
  return response.data.data
}

export async function dispatchDelivery(
  deliveryId: number,
  payload: DispatchDeliveryPayload,
): Promise<DeliveryDto> {
  const response = await apiClient.post<ApiResponse<DeliveryDto>>(
    `/deliveries/${deliveryId}/dispatch`,
    payload,
  )
  return response.data.data
}

export async function completeDelivery(
  deliveryId: number,
  payload: CompleteDeliveryPayload,
): Promise<DeliveryDto> {
  const response = await apiClient.post<ApiResponse<DeliveryDto>>(
    `/deliveries/${deliveryId}/deliver`,
    payload,
  )
  return response.data.data
}

export async function uploadDeliveryEvidence(
  deliveryId: number,
  file: File,
): Promise<DeliveryDto> {
  const form = new FormData()
  form.append('file', file)

  const response = await apiClient.post<ApiResponse<DeliveryDto>>(
    `/deliveries/${deliveryId}/evidence-file`,
    form,
  )
  return response.data.data
}

export async function attachDeliveryEvidence(
  deliveryId: number,
  payload: AttachDeliveryEvidencePayload,
): Promise<DeliveryDto> {
  const response = await apiClient.put<ApiResponse<DeliveryDto>>(
    `/deliveries/${deliveryId}/evidence`,
    payload,
  )
  return response.data.data
}

export async function cancelDelivery(
  deliveryId: number,
  payload: CancelDeliveryPayload,
): Promise<DeliveryDto> {
  const response = await apiClient.post<ApiResponse<DeliveryDto>>(
    `/deliveries/${deliveryId}/cancel`,
    payload,
  )
  return response.data.data
}
