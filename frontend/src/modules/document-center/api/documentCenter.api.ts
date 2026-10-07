import { apiClient } from '@/shared/api/apiClient'
import type { ApiResponse } from '@/shared/api/api.types'
import type {
  DocumentCenterDto,
  DocumentCenterVersionDto,
} from '../types/documentCenter.types'

export async function getDocumentCenter(): Promise<DocumentCenterDto[]> {
  const response =
    await apiClient.get<ApiResponse<DocumentCenterDto[]>>('/documents')

  return response.data.data
}

export async function getDocumentVersions(
  document: Pick<DocumentCenterDto, 'id'>,
): Promise<DocumentCenterVersionDto[]> {
  const response = await apiClient.get<
    ApiResponse<DocumentCenterVersionDto[]>
  >(`/documents/${document.id}/versions`)

  return response.data.data
}

export async function getDocumentContent(
  document: Pick<DocumentCenterDto, 'id'>,
  versionId: number,
  download = false,
): Promise<Blob> {
  const response = await apiClient.get<Blob>(
    `/documents/${document.id}/versions/${versionId}/content`,
    {
      params: download ? { download: true } : undefined,
      responseType: 'blob',
    },
  )

  return response.data
}
