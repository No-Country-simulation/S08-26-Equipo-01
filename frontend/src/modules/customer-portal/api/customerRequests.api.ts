import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  CancelCustomerRequestPayload,
  CustomerInformationRequestDto,
  CustomerRequestDetailDto,
  CustomerRequestSummaryDto,
  RequestDocumentDto,
  RequestDocumentUpload,
  RequestDocumentVersionDto,
  RespondInformationPayload,
  SubmitCustomerRequestInput,
} from '../types/customerRequest.types'

function basePath(customerId: number): string {
  return `/customers/${customerId}/requests`
}

function appendOptional(
  formData: FormData,
  key: string,
  value: string | undefined,
) {
  const normalized = value?.trim()
  if (normalized) formData.append(key, normalized)
}

function appendDocument(
  formData: FormData,
  prefix: string,
  document: RequestDocumentUpload,
) {
  appendOptional(formData, `${prefix}.documentType`, document.documentType)
  appendOptional(formData, `${prefix}.name`, document.name)
  appendOptional(formData, `${prefix}.description`, document.description)
  formData.append(`${prefix}.file`, document.file)
}

export async function getCustomerRequests(
  customerId: number,
): Promise<CustomerRequestSummaryDto[]> {
  const response = await apiClient.get<
    ApiResponse<CustomerRequestSummaryDto[]>
  >(basePath(customerId))

  return response.data.data
}

export async function getCustomerRequest(
  customerId: number,
  requestId: number,
): Promise<CustomerRequestDetailDto> {
  const response = await apiClient.get<ApiResponse<CustomerRequestDetailDto>>(
    `${basePath(customerId)}/${requestId}`,
  )

  return response.data.data
}

export async function submitCustomerRequest(
  customerId: number,
  input: SubmitCustomerRequestInput,
): Promise<CustomerRequestSummaryDto> {
  const formData = new FormData()
  appendOptional(formData, 'customerReference', input.customerReference)
  formData.append('title', input.title.trim())
  formData.append('description', input.description.trim())
  formData.append('quantity', String(input.quantity))
  formData.append('materialRequirementType', input.materialRequirementType)
  formData.append('materialRequirement', input.materialRequirement.trim())
  appendOptional(formData, 'requestedDeliveryDate', input.requestedDeliveryDate)
  formData.append('deliveryMode', input.deliveryMode)
  if (input.customerAddressId !== undefined) {
    formData.append('customerAddressId', String(input.customerAddressId))
  }
  appendOptional(formData, 'deliveryLabel', input.deliveryLabel)
  appendOptional(formData, 'deliveryAddress', input.deliveryAddress)
  appendOptional(formData, 'deliveryCity', input.deliveryCity)
  appendOptional(formData, 'deliveryState', input.deliveryState)
  appendOptional(formData, 'deliveryPostalCode', input.deliveryPostalCode)
  appendOptional(formData, 'deliveryCountry', input.deliveryCountry)
  appendOptional(formData, 'deliveryContactName', input.deliveryContactName)
  appendOptional(formData, 'deliveryContactPhone', input.deliveryContactPhone)
  appendOptional(formData, 'deliveryInstructions', input.deliveryInstructions)

  input.documents.forEach((document, index) =>
    appendDocument(formData, `documents[${index}]`, document),
  )

  const response = await apiClient.post<ApiResponse<CustomerRequestSummaryDto>>(
    basePath(customerId),
    formData,
  )

  return response.data.data
}

export async function respondCustomerInformationRequest(
  customerId: number,
  requestId: number,
  informationRequestId: number,
  payload: RespondInformationPayload,
): Promise<CustomerInformationRequestDto> {
  const response = await apiClient.post<
    ApiResponse<CustomerInformationRequestDto>
  >(
    `${basePath(customerId)}/${requestId}/information-requests/${informationRequestId}/response`,
    payload,
  )

  return response.data.data
}

export async function cancelCustomerRequest(
  customerId: number,
  requestId: number,
  payload: CancelCustomerRequestPayload,
): Promise<CustomerRequestSummaryDto> {
  const response = await apiClient.post<ApiResponse<CustomerRequestSummaryDto>>(
    `${basePath(customerId)}/${requestId}/cancel`,
    payload,
  )

  return response.data.data
}

export async function createCustomerRequestDocument(
  customerId: number,
  requestId: number,
  input: RequestDocumentUpload,
): Promise<RequestDocumentDto> {
  const formData = new FormData()
  appendOptional(formData, 'documentType', input.documentType)
  appendOptional(formData, 'name', input.name)
  appendOptional(formData, 'description', input.description)
  formData.append('file', input.file)

  const response = await apiClient.post<ApiResponse<RequestDocumentDto>>(
    `${basePath(customerId)}/${requestId}/documents`,
    formData,
  )

  return response.data.data
}

export async function addCustomerRequestDocumentVersion(
  customerId: number,
  requestId: number,
  documentId: number,
  file: File,
): Promise<RequestDocumentVersionDto> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<ApiResponse<RequestDocumentVersionDto>>(
    `${basePath(customerId)}/${requestId}/documents/${documentId}/versions`,
    formData,
  )

  return response.data.data
}

export async function getCustomerRequestDocumentVersions(
  customerId: number,
  requestId: number,
  documentId: number,
): Promise<RequestDocumentVersionDto[]> {
  const response = await apiClient.get<
    ApiResponse<RequestDocumentVersionDto[]>
  >(`${basePath(customerId)}/${requestId}/documents/${documentId}/versions`)

  return response.data.data
}

export async function removeCustomerRequestDocument(
  customerId: number,
  requestId: number,
  documentId: number,
): Promise<void> {
  await apiClient.delete(
    `${basePath(customerId)}/${requestId}/documents/${documentId}`,
  )
}

export async function getCustomerRequestDocumentContent(
  customerId: number,
  requestId: number,
  documentId: number,
  versionId: number,
  download = false,
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `${basePath(customerId)}/${requestId}/documents/${documentId}/versions/${versionId}/content`,
    {
      params: download ? { download: true } : undefined,
      responseType: 'blob',
    },
  )

  return response.data
}
