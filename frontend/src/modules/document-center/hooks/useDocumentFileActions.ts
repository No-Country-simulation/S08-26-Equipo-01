import { useState } from 'react'
import { useBlobPreview } from '@/shared/hooks/useBlobPreview'
import { getDocumentContent } from '../api/documentCenter.api'
import type { DocumentCenterDto } from '../types/documentCenter.types'

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function useDocumentFileActions() {
  const [busyVersionId, setBusyVersionId] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)
  const preview = useBlobPreview()

  const openVersion = async (
    document: Pick<DocumentCenterDto, 'id'>,
    versionId: number,
    fileName: string,
  ) => {
    setBusyVersionId(versionId)
    setError(null)

    try {
      const blob = await getDocumentContent(document, versionId, false)
      preview.openPreview(blob, fileName)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setBusyVersionId(null)
    }
  }

  const downloadVersion = async (
    document: Pick<DocumentCenterDto, 'id'>,
    versionId: number,
    fileName: string,
  ) => {
    setBusyVersionId(versionId)
    setError(null)

    try {
      const blob = await getDocumentContent(document, versionId, true)
      downloadBlob(blob, fileName)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setBusyVersionId(null)
    }
  }

  return {
    busyVersionId,
    error,
    preview: preview.preview,
    closePreview: preview.closePreview,
    openVersion,
    downloadVersion,
  }
}
