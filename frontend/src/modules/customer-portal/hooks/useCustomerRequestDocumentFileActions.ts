import { useRef, useState } from 'react'
import { useBlobPreview } from '@/shared/hooks/useBlobPreview'
import { getCustomerRequestDocumentContent } from '../api/customerRequests.api'
import type { RequestDocumentVersionDto } from '../types/customerRequest.types'

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

export function useCustomerRequestDocumentFileActions(
  customerId: number,
  requestId: number,
) {
  const actionLock = useRef(false)
  const [busy, setBusy] = useState<{
    versionId: number
    action: 'open' | 'download'
  } | null>(null)
  const [error, setError] = useState<unknown>(null)
  const preview = useBlobPreview()

  const openVersion = async (
    documentId: number,
    version: RequestDocumentVersionDto,
  ) => {
    if (actionLock.current) return
    actionLock.current = true

    setBusy({ versionId: version.id, action: 'open' })
    setError(null)

    try {
      const blob = await getCustomerRequestDocumentContent(
        customerId,
        requestId,
        documentId,
        version.id,
        false,
      )
      preview.openPreview(blob, version.fileName)
    } catch (requestError) {
      setError(requestError)
    } finally {
      actionLock.current = false
      setBusy(null)
    }
  }

  const downloadVersion = async (
    documentId: number,
    version: RequestDocumentVersionDto,
  ) => {
    if (actionLock.current) return
    actionLock.current = true

    setBusy({ versionId: version.id, action: 'download' })
    setError(null)

    try {
      const blob = await getCustomerRequestDocumentContent(
        customerId,
        requestId,
        documentId,
        version.id,
        true,
      )
      downloadBlob(blob, version.fileName)
    } catch (requestError) {
      setError(requestError)
    } finally {
      actionLock.current = false
      setBusy(null)
    }
  }

  const clearError = () => setError(null)

  return {
    busy,
    error,
    preview: preview.preview,
    closePreview: preview.closePreview,
    clearError,
    openVersion,
    downloadVersion,
  }
}
