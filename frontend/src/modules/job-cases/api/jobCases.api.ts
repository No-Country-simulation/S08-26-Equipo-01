import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  CaseInformationRequestDto,
  CaseMaterialSpecificationDto,
  CreateInformationRequestPayload,
  DefineMaterialSpecificationPayload,
  JobCaseDetailDto,
  JobCaseDocumentVersionDto,
  JobCaseDto,
  JobCaseTimelinePageDto,
} from '../types/jobCase.types'

export async function getJobCases(): Promise<JobCaseDto[]> {
  const response = await apiClient.get<ApiResponse<JobCaseDto[]>>('/job-cases')

  return response.data.data
}

export async function getJobCase(caseId: number): Promise<JobCaseDetailDto> {
  const response = await apiClient.get<ApiResponse<JobCaseDetailDto>>(
    `/job-cases/${caseId}`,
  )

  return response.data.data
}

export async function getJobCaseTimeline(
  caseId: number,
  options: {
    limit?: number
    cursor?: string | null
  } = {},
): Promise<JobCaseTimelinePageDto> {
  const response = await apiClient.get<ApiResponse<JobCaseTimelinePageDto>>(
    `/job-cases/${caseId}/timeline`,
    {
      params: {
        limit: options.limit ?? 20,
        ...(options.cursor ? { cursor: options.cursor } : {}),
      },
    },
  )

  return response.data.data
}

export async function getJobCaseDocumentVersions(
  documentId: number,
): Promise<JobCaseDocumentVersionDto[]> {
  const response = await apiClient.get<
    ApiResponse<JobCaseDocumentVersionDto[]>
  >(`/documents/${documentId}/versions`)

  return response.data.data
}

export async function getJobCaseDocumentContent(
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

export async function takeJobCase(caseId: number): Promise<JobCaseDto> {
  const response = await apiClient.post<ApiResponse<JobCaseDto>>(
    `/job-cases/${caseId}/take`,
  )

  return response.data.data
}

export async function requestJobCaseInformation(
  caseId: number,
  payload: CreateInformationRequestPayload,
): Promise<CaseInformationRequestDto> {
  const response = await apiClient.post<ApiResponse<CaseInformationRequestDto>>(
    `/job-cases/${caseId}/information-requests`,
    payload,
  )

  return response.data.data
}

export async function defineJobCaseMaterial(
  caseId: number,
  payload: DefineMaterialSpecificationPayload,
): Promise<CaseMaterialSpecificationDto> {
  const response = await apiClient.put<
    ApiResponse<CaseMaterialSpecificationDto>
  >(`/job-cases/${caseId}/material-specification`, payload)

  return response.data.data
}

export async function completeJobCaseReview(
  caseId: number,
): Promise<JobCaseDto> {
  const response = await apiClient.post<ApiResponse<JobCaseDto>>(
    `/job-cases/${caseId}/review/complete`,
  )

  return response.data.data
}
