import { useState } from 'react'
import { getDocumentContent } from '../api/documentCenter.api'
import type { DocumentCenterDto } from '../types/documentCenter.types'

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

export function useDocumentFileActions() {
  const [busyVersionId, setBusyVersionId] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)

  const openVersion = async (
    document: Pick<DocumentCenterDto, 'id'>,
    versionId: number,
  ) => {
    const previewWindow = window.open('', '_blank')

    if (previewWindow) {
      previewWindow.opener = null
      previewWindow.document.title = 'Cargando documento…'
      previewWindow.document.body.textContent = 'Cargando documento…'
    }

    setBusyVersionId(versionId)
    setError(null)

    try {
      const blob = await getDocumentContent(document, versionId, false)
      openBlob(blob, previewWindow)
    } catch (requestError) {
      previewWindow?.close()
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
    openVersion,
    downloadVersion,
  }
}
