import { useCallback, useEffect, useRef, useState } from 'react'

export interface BlobPreview {
  url: string
  fileName: string
  mimeType: string
}

export function useBlobPreview() {
  const previewUrlRef = useRef<string | null>(null)
  const [preview, setPreview] = useState<BlobPreview | null>(null)

  const closePreview = useCallback(() => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
      previewUrlRef.current = null
    }

    setPreview(null)
  }, [])

  const openPreview = useCallback((blob: Blob, fileName: string) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current)
    }

    const url = URL.createObjectURL(blob)
    previewUrlRef.current = url
    setPreview({
      url,
      fileName,
      mimeType: blob.type || 'application/octet-stream',
    })
  }, [])

  useEffect(
    () => () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current)
      }
    },
    [],
  )

  return {
    preview,
    openPreview,
    closePreview,
  }
}
