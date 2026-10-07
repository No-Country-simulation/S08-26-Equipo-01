import { useQuery } from '@tanstack/react-query'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { ActionIconButton } from '@/shared/components/ui/ActionIconButton'
import { Button } from '@/shared/components/ui/Button'
import { getJobCaseDocumentVersions } from '../api/jobCases.api'
import {
  formatJobCaseDateTime,
  formatJobCaseFileSize,
} from '../model/jobCasePresenter'
import type {
  JobCaseDocumentVersionDto,
  RequestDocumentDto,
} from '../types/jobCase.types'

interface JobCaseDocumentHistoryDialogProps {
  document: RequestDocumentDto | null
  busyVersionId: number | null
  onClose: () => void
  onOpenVersion: (
    documentId: number,
    version: JobCaseDocumentVersionDto,
  ) => void
  onDownloadVersion: (
    documentId: number,
    version: JobCaseDocumentVersionDto,
  ) => void
}

export function JobCaseDocumentHistoryDialog({
  document,
  busyVersionId,
  onClose,
  onOpenVersion,
  onDownloadVersion,
}: JobCaseDocumentHistoryDialogProps) {
  const query = useQuery({
    queryKey: ['job-cases', 'documents', document?.id ?? 0, 'versions'],
    queryFn: () => getJobCaseDocumentVersions(document?.id ?? 0),
    enabled: document !== null,
  })

  if (!document) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-case-document-history-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Historial de versiones
          </p>
          <h2
            id="job-case-document-history-title"
            className="mt-0.5 truncate text-[14px] font-semibold text-slate-950"
          >
            {document.name}
          </h2>
          <p className="mt-0.5 truncate text-[9px] text-slate-500">
            {document.documentType}
          </p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-4 py-3.5">
          {query.isPending ? (
            <LoadingState label="Cargando versiones…" />
          ) : query.isError ? (
            <ErrorState
              error={query.error}
              title="No pudimos cargar el historial"
            />
          ) : (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {query.data.map((version) => (
                <article
                  key={version.id}
                  className="flex flex-col gap-2.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[9px] font-semibold text-slate-900">
                      Versión {version.version} · {version.fileName}
                    </p>
                    <p className="mt-0.5 text-[8px] text-slate-500">
                      {formatJobCaseFileSize(version.fileSize)} ·{' '}
                      {formatJobCaseDateTime(version.uploadedAt)}
                    </p>
                    <p className="mt-0.5 truncate text-[7px] text-slate-400">
                      {version.uploadedByName ?? 'Usuario no disponible'}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    <ActionIconButton
                      icon="view"
                      label={`Ver versión ${version.version}`}
                      tone="primary"
                      disabled={busyVersionId !== null}
                      onClick={() => onOpenVersion(document.id, version)}
                    />
                    <ActionIconButton
                      icon="download"
                      label={`Descargar versión ${version.version}`}
                      disabled={busyVersionId !== null}
                      onClick={() => onDownloadVersion(document.id, version)}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </section>
    </div>
  )
}
