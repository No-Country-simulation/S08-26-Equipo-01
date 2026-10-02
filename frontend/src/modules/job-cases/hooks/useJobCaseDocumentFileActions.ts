import { useRef, useState } from 'react'
import { getJobCaseDocumentContent } from '../api/jobCases.api'
import type { JobCaseDocumentVersionDto } from '../types/jobCase.types'

function scheduleUrlRelease(url: string) {
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

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

function openBlob(blob: Blob, previewWindow: Window | null) {
  const url = URL.createObjectURL(blob)

  if (previewWindow) {
    previewWindow.location.replace(url)
  } else {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  scheduleUrlRelease(url)
}

export function useJobCaseDocumentFileActions() {
  const actionLock = useRef(false)
  const [busy, setBusy] = useState<{
    versionId: number
    action: 'open' | 'download'
  } | null>(null)
  const [error, setError] = useState<unknown>(null)

  const openVersion = async (
    documentId: number,
    version: JobCaseDocumentVersionDto,
  ) => {
    if (actionLock.current) return
    actionLock.current = true

    const previewWindow = window.open('', '_blank')

    if (previewWindow) {
      previewWindow.opener = null
      previewWindow.document.title = 'Cargando documento…'
      previewWindow.document.body.textContent = 'Cargando documento…'
    }

    setBusy({ versionId: version.id, action: 'open' })
    setError(null)

    try {
      const blob = await getJobCaseDocumentContent(
        documentId,
        version.id,
        false,
      )
      openBlob(blob, previewWindow)
    } catch (requestError) {
      previewWindow?.close()
      setError(requestError)
    } finally {
      actionLock.current = false
      setBusy(null)
    }
  }

  const downloadVersion = async (
    documentId: number,
    version: JobCaseDocumentVersionDto,
  ) => {
    if (actionLock.current) return
    actionLock.current = true

    setBusy({ versionId: version.id, action: 'download' })
    setError(null)

    try {
      const blob = await getJobCaseDocumentContent(documentId, version.id, true)
      downloadBlob(blob, version.fileName)
    } catch (requestError) {
      setError(requestError)
    } finally {
      actionLock.current = false
      setBusy(null)
    }
  }

  return {
    busy,
    error,
    clearError: () => setError(null),
    openVersion,
    downloadVersion,
  }
}
