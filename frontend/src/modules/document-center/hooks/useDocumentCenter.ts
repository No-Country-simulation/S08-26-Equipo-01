import { useQuery } from '@tanstack/react-query'
import {
  getDocumentCenter,
  getDocumentVersions,
} from '../api/documentCenter.api'
import type { DocumentCenterDto } from '../types/documentCenter.types'

export const documentCenterKeys = {
  all: ['document-center'] as const,
  list: () => [...documentCenterKeys.all, 'list'] as const,
  versions: (documentId: number) =>
    [...documentCenterKeys.all, 'versions', documentId] as const,
}

export function useDocumentCenter() {
  return useQuery({
    queryKey: documentCenterKeys.list(),
    queryFn: getDocumentCenter,
  })
}

export function useDocumentVersions(document: DocumentCenterDto | null) {
  return useQuery({
    queryKey: documentCenterKeys.versions(document?.id ?? 0),
    queryFn: () => getDocumentVersions(document as DocumentCenterDto),
    enabled: document !== null,
  })
}
