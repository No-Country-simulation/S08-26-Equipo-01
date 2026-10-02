import { Button } from '@/shared/components/ui/Button'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useCustomerRequestDocumentVersions } from '../hooks/useCustomerRequests'
import {
  formatCustomerRequestDateTime,
  formatFileSize,
} from '../model/customerRequestPresenter'
import type { RequestDocumentVersionDto } from '../types/customerRequest.types'

interface RequestDocumentHistoryDialogProps {
  customerId: number
  requestId: number
  documentId: number | null
  documentName: string
  fileError: unknown
  busy: {
    versionId: number
    action: 'open' | 'download'
  } | null
  onClose: () => void
  onOpenVersion: (version: RequestDocumentVersionDto) => void
  onDownloadVersion: (version: RequestDocumentVersionDto) => void
}

export function RequestDocumentHistoryDialog({
  customerId,
  requestId,
  documentId,
  documentName,
  fileError,
  busy,
  onClose,
  onOpenVersion,
  onDownloadVersion,
}: RequestDocumentHistoryDialogProps) {
  const query = useCustomerRequestDocumentVersions(
    customerId,
    requestId,
    documentId,
  )

  if (documentId === null) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-history-title"
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">
            Historial de versiones
          </p>
          <h2
            id="document-history-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            {documentName}
          </h2>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {fileError ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {getErrorMessage(fileError)}
            </p>
          ) : null}

          {query.isPending ? (
            <LoadingState label="Cargando versiones…" />
          ) : query.isError ? (
            <ErrorState
              error={query.error}
              title="No pudimos cargar las versiones"
            />
          ) : (
            <div className="space-y-3">
              {query.data.map((version) => (
                <article
                  key={version.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-950">
                      Versión {version.version} · {version.fileName}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {formatFileSize(version.fileSize)} ·{' '}
                      {formatCustomerRequestDateTime(version.uploadedAt)}
                      {version.uploadedByName
                        ? ` · ${version.uploadedByName}`
                        : ''}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy !== null}
                      onClick={() => onOpenVersion(version)}
                    >
                      {busy?.versionId === version.id &&
                      busy.action === 'open'
                        ? 'Abriendo…'
                        : 'Ver'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy !== null}
                      onClick={() => onDownloadVersion(version)}
                    >
                      {busy?.versionId === version.id &&
                      busy.action === 'download'
                        ? 'Descargando…'
                        : 'Descargar'}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </section>
    </div>
  )
}
