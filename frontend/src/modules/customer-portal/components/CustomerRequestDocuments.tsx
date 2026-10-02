import { useRef, useState } from 'react'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useCustomerRequestDocumentFileActions } from '../hooks/useCustomerRequestDocumentFileActions'
import {
  formatCustomerRequestDateTime,
  formatFileSize,
} from '../model/customerRequestPresenter'
import type { RequestDocumentDto } from '../types/customerRequest.types'
import { RequestDocumentDialog } from './RequestDocumentDialog'
import { RequestDocumentHistoryDialog } from './RequestDocumentHistoryDialog'

interface CustomerRequestDocumentsProps {
  customerId: number
  requestId: number
  documents: RequestDocumentDto[]
  canModify: boolean
  adding: boolean
  addingVersion: boolean
  removing: boolean
  mutationError: unknown
  onAddDocument: Parameters<typeof RequestDocumentDialog>[0]['onSubmit']
  onAddVersion: (documentId: number, file: File) => Promise<boolean>
  onRemove: (documentId: number) => Promise<boolean>
  onResetErrors: () => void
}

export function CustomerRequestDocuments({
  customerId,
  requestId,
  documents,
  canModify,
  adding,
  addingVersion,
  removing,
  mutationError,
  onAddDocument,
  onAddVersion,
  onRemove,
  onResetErrors,
}: CustomerRequestDocumentsProps) {
  const [addOpen, setAddOpen] = useState(false)
  const [history, setHistory] = useState<RequestDocumentDto | null>(null)
  const [removeId, setRemoveId] = useState<number | null>(null)
  const files = useCustomerRequestDocumentFileActions(customerId, requestId)
  const versionInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  return (
    <>
      <Card className="border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/25 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
        <div className="flex flex-col gap-3 border-b border-blue-100/70 pb-3 sm:flex-row sm:items-start sm:justify-between">
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
                Consulta la versión vigente, descarga archivos y revisa su historial.
              </p>
            </div>
          </div>

          {canModify ? (
            <Button
              size="sm"
              className="!h-7 !rounded-lg !px-2.5 !text-[9px]"
              onClick={() => {
                onResetErrors()
                files.clearError()
                setAddOpen(true)
              }}
            >
              Agregar documento
            </Button>
          ) : null}
        </div>

        {files.error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {getErrorMessage(files.error)}
          </p>
        ) : null}

        {documents.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-slate-200 px-4 py-6 text-center text-xs text-slate-500">
            No hay documentos adjuntos a esta solicitud.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {documents.map((documentItem) => {
              const version = documentItem.currentVersion
              const confirmingRemove = removeId === documentItem.id

              return (
                <article
                  key={documentItem.id}
                  className="rounded-xl border border-slate-200/90 bg-white/90 p-3.5 shadow-[0_8px_24px_-24px_rgba(37,99,235,0.45)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-950">
                        {documentItem.name}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-500">
                        {version.fileName} · Versión {version.version} ·{' '}
                        {formatFileSize(version.fileSize)}
                      </p>
                      <p className="mt-1 text-[9px] text-slate-400">
                        Actualizada{' '}
                        {formatCustomerRequestDateTime(version.uploadedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 [&_button]:!h-7 [&_button]:!px-2.5 [&_button]:!text-[9px]">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={files.busy !== null}
                        onClick={() =>
                          void files.openVersion(documentItem.id, version)
                        }
                      >
                        {files.busy?.versionId === version.id &&
                        files.busy.action === 'open'
                          ? 'Abriendo…'
                          : 'Ver'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={files.busy !== null}
                        onClick={() =>
                          void files.downloadVersion(documentItem.id, version)
                        }
                      >
                        {files.busy?.versionId === version.id &&
                        files.busy.action === 'download'
                          ? 'Descargando…'
                          : 'Descargar'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          files.clearError()
                          setHistory(documentItem)
                        }}
                      >
                        Historial
                      </Button>

                      {canModify ? (
                        <>
                          <input
                            ref={(element) => {
                              versionInputRefs.current[documentItem.id] =
                                element
                            }}
                            type="file"
                            className="sr-only"
                            onChange={(event) => {
                              const file = event.target.files?.[0]
                              if (file) {
                                void onAddVersion(documentItem.id, file)
                              }
                              event.target.value = ''
                            }}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={addingVersion}
                            onClick={() =>
                              versionInputRefs.current[documentItem.id]?.click()
                            }
                          >
                            Nueva versión
                          </Button>

                          {confirmingRemove ? (
                            <>
                              <Button
                                size="sm"
                                variant="danger"
                                disabled={removing}
                                onClick={() => {
                                  void onRemove(documentItem.id).then(
                                    (removed) => {
                                      if (removed) setRemoveId(null)
                                    },
                                  )
                                }}
                              >
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setRemoveId(null)}
                              >
                                No quitar
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRemoveId(documentItem.id)}
                            >
                              Quitar
                            </Button>
                          )}
                        </>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {mutationError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {getErrorMessage(mutationError)}
          </p>
        ) : null}
      </Card>

      <RequestDocumentDialog
        open={addOpen}
        submitting={adding}
        error={mutationError}
        onClose={() => setAddOpen(false)}
        onSubmit={onAddDocument}
      />

      <RequestDocumentHistoryDialog
        customerId={customerId}
        requestId={requestId}
        documentId={history?.id ?? null}
        documentName={history?.name ?? ''}
        fileError={files.error}
        busy={files.busy}
        onClose={() => {
          files.clearError()
          setHistory(null)
        }}
        onOpenVersion={(version) => {
          if (history) void files.openVersion(history.id, version)
        }}
        onDownloadVersion={(version) => {
          if (history) void files.downloadVersion(history.id, version)
        }}
      />
    </>
  )
}
