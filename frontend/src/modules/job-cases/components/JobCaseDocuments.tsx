import { useState } from 'react'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useJobCaseDocumentFileActions } from '../hooks/useJobCaseDocumentFileActions'
import {
  formatJobCaseDateTime,
  formatJobCaseFileSize,
} from '../model/jobCasePresenter'
import type { RequestDocumentDto } from '../types/jobCase.types'
import { JobCaseDocumentHistoryDialog } from './JobCaseDocumentHistoryDialog'

interface JobCaseDocumentsProps {
  documents: RequestDocumentDto[]
}

export function JobCaseDocuments({ documents }: JobCaseDocumentsProps) {
  const [historyDocument, setHistoryDocument] =
    useState<RequestDocumentDto | null>(null)
  const files = useJobCaseDocumentFileActions()

  if (documents.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <EmptyState
          title="Sin documentos"
          description="La solicitud todavía no tiene documentos disponibles para revisión."
        />
      </section>
    )
  }

  return (
    <>
      <Card className="overflow-hidden border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/25 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
        <div className="flex flex-col gap-3 border-b border-blue-100/70 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SidebarNavIcon name="documents" className="h-[17px] w-[17px]" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Archivos del trabajo
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
                Documentos
              </h2>
              <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
                Abre los archivos que sustentan la revisión y consulta sus
                versiones.
              </p>
            </div>
          </div>

          <span className="shrink-0 text-[8px] text-slate-400">
            {documents.length} archivo{documents.length === 1 ? '' : 's'}
          </span>
        </div>

        {files.error ? (
          <p
            role="alert"
            className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
          >
            {getErrorMessage(files.error)}
          </p>
        ) : null}

        <div className="divide-y divide-slate-100">
          {documents.map((document) => {
            const version = document.currentVersion
            const opening =
              files.busy?.versionId === version.id &&
              files.busy.action === 'open'
            const downloading =
              files.busy?.versionId === version.id &&
              files.busy.action === 'download'

            return (
              <article
                id={`document-${document.id}`}
                key={document.id}
                className="scroll-mt-24 px-4 py-3.5 target:bg-blue-50/40"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-blue-600">
                        {document.documentType}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[7px] font-medium text-slate-500">
                        v{version.version}
                      </span>
                    </div>

                    <h3 className="mt-1 truncate text-[11px] font-semibold text-slate-950">
                      {document.name}
                    </h3>

                    {document.description ? (
                      <p className="mt-1 max-w-3xl whitespace-pre-wrap text-[9px] leading-4 text-slate-600">
                        {document.description}
                      </p>
                    ) : null}

                    <p className="mt-1.5 text-[8px] text-slate-500">
                      {version.fileName} ·{' '}
                      {formatJobCaseFileSize(version.fileSize)}
                    </p>
                    <p className="mt-0.5 text-[7px] text-slate-400">
                      Actualizado {formatJobCaseDateTime(version.uploadedAt)}{' '}
                      por {version.uploadedByName ?? 'usuario no disponible'}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="!h-7 !px-2.5 !text-[8px]"
                      disabled={files.busy !== null}
                      onClick={() =>
                        void files.openVersion(document.id, version)
                      }
                    >
                      {opening ? 'Abriendo…' : 'Ver'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="!h-7 !px-2.5 !text-[8px]"
                      disabled={files.busy !== null}
                      onClick={() =>
                        void files.downloadVersion(document.id, version)
                      }
                    >
                      {downloading ? 'Descargando…' : 'Descargar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="!h-7 !px-2.5 !text-[8px]"
                      onClick={() => {
                        files.clearError()
                        setHistoryDocument(document)
                      }}
                    >
                      Historial
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </Card>

      <JobCaseDocumentHistoryDialog
        document={historyDocument}
        busyVersionId={files.busy?.versionId ?? null}
        onClose={() => setHistoryDocument(null)}
        onOpenVersion={(documentId, version) =>
          void files.openVersion(documentId, version)
        }
        onDownloadVersion={(documentId, version) =>
          void files.downloadVersion(documentId, version)
        }
      />
    </>
  )
}
