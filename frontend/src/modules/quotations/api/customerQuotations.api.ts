import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  CustomerQuotationDetailDto,
  CustomerQuotationSummaryDto,
  RejectCustomerQuotationPayload,
  RequestCustomerQuotationAdjustmentPayload,
} from '../types/customerQuotation.types'

function basePath(customerId: number): string {
  return `/customers/${customerId}/quotations`
}

export async function getCustomerQuotations(
  customerId: number,
): Promise<CustomerQuotationSummaryDto[]> {
  const response = await apiClient.get<
    ApiResponse<CustomerQuotationSummaryDto[]>
  >(basePath(customerId))

  return response.data.data
}

export async function getCustomerQuotation(
  customerId: number,
  quotationId: number,
): Promise<CustomerQuotationDetailDto> {
  const response = await apiClient.get<ApiResponse<CustomerQuotationDetailDto>>(
    `${basePath(customerId)}/${quotationId}`,
  )

  return response.data.data
}

export async function getCustomerQuotationRevisions(
  customerId: number,
  quotationId: number,
): Promise<CustomerQuotationSummaryDto[]> {
  const response = await apiClient.get<
    ApiResponse<CustomerQuotationSummaryDto[]>
  >(`${basePath(customerId)}/${quotationId}/revisions`)

  return response.data.data
}

export async function approveCustomerQuotation(
  customerId: number,
  quotationId: number,
): Promise<CustomerQuotationDetailDto> {
  const response = await apiClient.post<
    ApiResponse<CustomerQuotationDetailDto>
  >(`${basePath(customerId)}/${quotationId}/approve`)

  return response.data.data
}

export async function requestCustomerQuotationAdjustment(
  customerId: number,
  quotationId: number,
  payload: RequestCustomerQuotationAdjustmentPayload,
): Promise<CustomerQuotationDetailDto> {
  const response = await apiClient.post<
    ApiResponse<CustomerQuotationDetailDto>
  >(`${basePath(customerId)}/${quotationId}/request-adjustment`, payload)

  return response.data.data
}

export async function rejectCustomerQuotation(
  customerId: number,
  quotationId: number,
  payload: RejectCustomerQuotationPayload,
): Promise<CustomerQuotationDetailDto> {
  const response = await apiClient.post<
    ApiResponse<CustomerQuotationDetailDto>
  >(`${basePath(customerId)}/${quotationId}/reject`, payload)

  return response.data.data
}
