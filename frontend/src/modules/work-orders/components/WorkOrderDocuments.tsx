import { Badge } from '@/shared/components/ui/Badge'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import type {
  WorkOrder360DocumentDto,
  WorkOrderDocumentContext,
} from '../types/workOrder360.types'

interface WorkOrderDocumentsProps {
  documents: WorkOrder360DocumentDto[]
}

const contextLabels: Record<WorkOrderDocumentContext, string> = {
  CASE: 'Expediente',
  WORK_ORDER: 'Orden de trabajo',
  MATERIAL: 'Material',
  DELIVERY: 'Entrega',
}

function contextSummary({
  document,
}: WorkOrder360DocumentDto): string {
  if (document.materialLotNumbers.length > 0) {
    return `Lote ${document.materialLotNumbers.join(', ')}`
  }

  if (document.deliveryIds.length > 0) {
    return `Entrega #${document.deliveryIds.join(', #')}`
  }

  return document.contexts
    .map((context) => contextLabels[context])
    .join(' · ')
}

export function WorkOrderDocuments({ documents }: WorkOrderDocumentsProps) {
  if (documents.length === 0) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <EmptyState
          title="Sin documentos"
          description="La vista 360 todavía no tiene documentos asociados al expediente o a sus recursos operativos."
        />
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Documentación relacionada
          </p>
          <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
            Documentos vinculados a la orden
          </h2>
        </div>
        <span className="text-[8px] text-slate-400">
          {documents.length} documentos
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {documents.map((entry) => {
          const { document, versions } = entry

          return (
            <article
              id={`document-${document.id}`}
              key={document.id}
              className="scroll-mt-24 px-4 py-3 target:bg-blue-50/40"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-[8px] font-bold uppercase tracking-wide text-blue-600">
                      {document.documentType}
                    </p>
                    {document.caseId === null ? (
                      <Badge tone="neutral" className="px-2 py-0.5 text-[7px]">
                        Recurso global
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-0.5 truncate text-[10px] font-semibold text-slate-950">
                    {document.name}
                  </h3>
                  <p className="mt-0.5 truncate text-[8px] text-slate-400">
                    {document.currentVersion.fileName} · {contextSummary(entry)}
                  </p>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-[9px] font-semibold text-slate-700">
                    v{document.currentVersion.version}
                  </p>
                  <p className="mt-0.5 text-[7px] text-slate-400">
                    {versions.length} versiones registradas
                  </p>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
