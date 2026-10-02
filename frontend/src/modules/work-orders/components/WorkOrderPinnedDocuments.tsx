import { useState } from 'react'
import { useDocumentFileActions } from '@/modules/document-center'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type { WorkOrderDocumentDto } from '../types/workOrder.types'
import type { WorkOrder360DocumentDto } from '../types/workOrder360.types'

interface WorkOrderPinnedDocumentsProps {
  documents: WorkOrder360DocumentDto[]
  pinnedDocuments: WorkOrderDocumentDto[]
  canEdit: boolean
  saving: boolean
  error: unknown
  onPin: (documentId: number, versionId: number) => Promise<void>
}

export function WorkOrderPinnedDocuments({
  documents,
  pinnedDocuments,
  canEdit,
  saving,
  error,
  onPin,
}: WorkOrderPinnedDocumentsProps) {
  const [selection, setSelection] = useState<Record<number, number>>({})
  const fileActions = useDocumentFileActions()

  const pinnedFor = (documentId: number) =>
    pinnedDocuments.find((item) => item.documentId === documentId)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          02 · Documentos
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-3">
          <h2 className="text-[11px] font-semibold text-slate-950">
            Versiones fijadas para fabricación
          </h2>
          <span className="text-[8px] text-slate-400">
            {pinnedDocuments.length} fijados
          </span>
        </div>
      </div>

      {documents.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title="No hay documentos disponibles"
            description="El expediente necesita documentos activos antes de preparar el paquete operativo."
          />
        </div>
      ) : (
        <>
          {error || fileActions.error ? (
            <p className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error ?? fileActions.error)}
            </p>
          ) : null}

          <div className="divide-y divide-slate-100">
            {documents.map(({ document, versions }) => {
              const pinned = pinnedFor(document.id)
              const availableVersions =
                versions.length > 0 ? versions : [document.currentVersion]
              const selectedVersionId =
                selection[document.id] ??
                pinned?.documentVersionId ??
                document.currentVersion.id
              const selectedVersion =
                availableVersions.find(
                  (version) => version.id === selectedVersionId,
                ) ?? document.currentVersion
              const openingSelected =
                fileActions.busyVersionId === selectedVersion.id

              return (
                <article key={document.id} className="px-4 py-3">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-blue-600">
                        {document.documentType}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-950">
                        {document.name}
                      </p>
                      <p className="mt-0.5 text-[8px] text-slate-400">
                        Vigente v{document.currentVersion.version}
                        {pinned
                          ? ` · Fijada v${pinned.version}`
                          : ' · Sin versión fijada'}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                      <div className="relative min-w-[170px]">
                        <select
                          aria-label={`Versión de ${document.name}`}
                          value={selectedVersionId}
                          disabled={!canEdit || saving}
                          onChange={(event) =>
                            setSelection((current) => ({
                              ...current,
                              [document.id]: Number(event.target.value),
                            }))
                          }
                          className="h-7 w-full appearance-none rounded-lg border border-slate-300 bg-white px-2 pr-7 !text-[8px] !font-normal !leading-none text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                        >
                          {availableVersions.map((version) => (
                            <option
                              key={version.id}
                              value={version.id}
                              className="text-[8px] font-normal"
                            >
                              v{version.version} · {version.fileName}
                            </option>
                          ))}
                        </select>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 20 20"
                          className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
                          fill="currentColor"
                        >
                          <path d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" />
                        </svg>
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        className="!h-7 !px-2.5 !text-[8px]"
                        disabled={openingSelected}
                        onClick={() =>
                          void fileActions.openVersion(
                            { id: document.id },
                            selectedVersion.id,
                          )
                        }
                      >
                        {openingSelected ? 'Abriendo…' : 'Abrir'}
                      </Button>

                      {canEdit ? (
                        <Button
                          size="sm"
                          variant={pinned ? 'secondary' : 'primary'}
                          className="!h-7 !px-2.5 !text-[8px]"
                          disabled={
                            saving ||
                            openingSelected ||
                            pinned?.documentVersionId === selectedVersionId
                          }
                          onClick={() =>
                            void onPin(document.id, selectedVersionId)
                          }
                        >
                          {pinned ? 'Actualizar versión' : 'Fijar versión'}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          {!canEdit ? (
            <p className="border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[7px] leading-3 text-slate-400">
              Las versiones quedan bloqueadas al aprobar la hoja de ruta o cuando la orden sale de preparación.
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}
