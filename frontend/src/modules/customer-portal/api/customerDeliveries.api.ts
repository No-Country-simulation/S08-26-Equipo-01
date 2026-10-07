import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type { CustomerDeliveryDto } from '../types/customerDelivery.types'

export async function getCustomerRequestDeliveries(
  customerId: number,
  requestId: number,
): Promise<CustomerDeliveryDto[]> {
  const response = await apiClient.get<ApiResponse<CustomerDeliveryDto[]>>(
    `/customers/${customerId}/requests/${requestId}/deliveries`,
  )

  return response.data.data
}


export async function getCustomerDeliveryEvidenceContent(
  customerId: number,
  requestId: number,
  documentId: number,
  versionId: number,
  download = false,
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/customers/${customerId}/requests/${requestId}/documents/${documentId}/versions/${versionId}/content`,
    {
      params: download ? { download: true } : undefined,
      responseType: 'blob',
    },
  )

  return response.data
}
