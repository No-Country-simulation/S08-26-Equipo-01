import { useEffect, useRef } from 'react'
import { Button } from '@/shared/components/ui/Button'
import type { BlobPreview } from '@/shared/hooks/useBlobPreview'

interface DocumentPreviewDialogProps {
  preview: BlobPreview | null
  onClose: () => void
}

function isPdf(preview: BlobPreview) {
  return (
    preview.mimeType.toLowerCase().includes('pdf') ||
    preview.fileName.toLowerCase().endsWith('.pdf')
  )
}

function isImage(preview: BlobPreview) {
  if (preview.mimeType.toLowerCase().startsWith('image/')) return true

  return /\.(png|jpe?g|gif|webp|bmp)$/i.test(preview.fileName)
}

function downloadPreview(preview: BlobPreview) {
  const anchor = document.createElement('a')
  anchor.href = preview.url
  anchor.download = preview.fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export function DocumentPreviewDialog({
  preview,
  onClose,
}: DocumentPreviewDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!preview) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, preview])

  if (!preview) return null

  const pdf = isPdf(preview)
  const image = isImage(preview)

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-[2px] sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-preview-title"
        className="flex h-[92vh] w-[96vw] max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:h-[90vh] sm:w-[92vw]"
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Vista previa
            </p>
            <h2
              id="document-preview-title"
              className="mt-0.5 truncate text-[12px] font-semibold text-slate-950 sm:text-[13px]"
              title={preview.fileName}
            >
              {preview.fileName}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              className="!h-8 !px-3 !text-[9px]"
              onClick={() => downloadPreview(preview)}
            >
              Descargar
            </Button>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Cerrar vista previa"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg leading-none text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 bg-slate-100/80">
          {pdf ? (
            <iframe
              src={preview.url}
              title={`Vista previa de ${preview.fileName}`}
              className="h-full w-full border-0 bg-white"
            />
          ) : image ? (
            <div className="flex h-full w-full items-center justify-center overflow-auto p-4 sm:p-6">
              <img
                src={preview.url}
                alt={preview.fileName}
                className="max-h-full max-w-full rounded-lg object-contain shadow-sm"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-6">
              <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-600">
                  📄
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-950">
                  Vista previa no disponible
                </h3>
                <p className="mt-1.5 text-[10px] leading-4 text-slate-500">
                  Este tipo de archivo no puede mostrarse directamente en el navegador.
                  Puedes descargarlo sin salir de QualityTrack.
                </p>
                <Button
                  size="sm"
                  className="mt-4 !h-8 !px-3 !text-[9px]"
                  onClick={() => downloadPreview(preview)}
                >
                  Descargar archivo
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
