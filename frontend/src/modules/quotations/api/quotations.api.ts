import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  QuotationDetailDto,
  QuotationDto,
  CancelQuotationPayload,
  SendQuotationPayload,
  UpdateQuotationPayload,
} from '../types/quotation.types'

export async function getQuotations(): Promise<QuotationDto[]> {
  const response =
    await apiClient.get<ApiResponse<QuotationDto[]>>('/quotations')

  return response.data.data
}

export async function getQuotation(
  quotationId: number,
): Promise<QuotationDetailDto> {
  const response = await apiClient.get<ApiResponse<QuotationDetailDto>>(
    `/quotations/${quotationId}`,
  )

  return response.data.data
}

export async function getQuotationRevisions(
  quotationId: number,
): Promise<QuotationDto[]> {
  const response = await apiClient.get<ApiResponse<QuotationDto[]>>(
    `/quotations/${quotationId}/revisions`,
  )

  return response.data.data
}

export async function createQuotation(
  caseId: number,
): Promise<QuotationDetailDto> {
  const response = await apiClient.post<ApiResponse<QuotationDetailDto>>(
    `/job-cases/${caseId}/quotations`,
  )

  return response.data.data
}

export async function updateQuotation(
  quotationId: number,
  payload: UpdateQuotationPayload,
): Promise<QuotationDetailDto> {
  const response = await apiClient.put<ApiResponse<QuotationDetailDto>>(
    `/quotations/${quotationId}`,
    payload,
  )

  return response.data.data
}

export async function sendQuotation(
  quotationId: number,
  payload?: SendQuotationPayload,
): Promise<QuotationDetailDto> {
  const response = await apiClient.post<ApiResponse<QuotationDetailDto>>(
    `/quotations/${quotationId}/send`,
    payload,
  )

  return response.data.data
}

export async function createQuotationRevision(
  quotationId: number,
): Promise<QuotationDetailDto> {
  const response = await apiClient.post<ApiResponse<QuotationDetailDto>>(
    `/quotations/${quotationId}/revisions`,
  )

  return response.data.data
}


export async function cancelQuotation(
  quotationId: number,
  payload: CancelQuotationPayload,
): Promise<QuotationDetailDto> {
  const response = await apiClient.post<ApiResponse<QuotationDetailDto>>(
    `/quotations/${quotationId}/cancel`,
    payload,
  )

  return response.data.data
}
