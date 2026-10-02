import { Badge } from '@/shared/components/ui/Badge'
import { getWorkOrder360Snapshot } from '../model/workOrder360Presenter'
import type { WorkOrder360Dto } from '../types/workOrder360.types'
import { WorkOrderOriginChain } from './WorkOrderOriginChain'

interface WorkOrderSummaryProps {
  data: WorkOrder360Dto
}

function DataItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-[8px] font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 text-[10px] font-semibold text-slate-800">{value}</dd>
    </div>
  )
}

export function WorkOrderSummary({ data }: WorkOrderSummaryProps) {
  const snapshot = getWorkOrder360Snapshot(data)
  const closedNonConformities = data.nonConformities.filter(
    (item) => item.status === 'CLOSED',
  ).length
  const openNonConformities =
    data.nonConformities.length - closedNonConformities

  return (
    <div className="space-y-3">
      <WorkOrderOriginChain data={data} />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
        <div className="grid xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.45fr)]">
          <div className="border-b border-slate-100 xl:border-b-0 xl:border-r">
            <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Snapshot operativo
              </p>
              <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
                Referencias vigentes de fabricación
              </h2>
            </div>

            <dl className="grid gap-x-6 gap-y-3 px-4 py-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <DataItem
                label="Cliente"
                value={data.workOrder.source.customerName}
              />
              <DataItem
                label="Cantidad"
                value={`${data.workOrder.plannedQuantity ?? data.workOrder.source.quantity} piezas`}
              />
              <DataItem label="Material" value={snapshot.material} />
              <DataItem label="Lote" value={snapshot.lot} />
              <DataItem label="Plano usado" value={snapshot.pinnedDocument} />
              <DataItem label="Cotización" value={snapshot.quotation} />
              <DataItem
                label="Routing producción"
                value={snapshot.productionRouting}
              />
              <DataItem
                label="Routing retrabajo"
                value={snapshot.reworkRouting}
              />
            </dl>
          </div>

          <div className="bg-slate-50/45 px-4 py-3.5">
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Estado de trazabilidad
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={
                  snapshot.complete
                    ? 'h-2 w-2 rounded-full bg-emerald-500'
                    : 'h-2 w-2 rounded-full bg-blue-500'
                }
              />
              <p className="text-[11px] font-semibold text-slate-950">
                {snapshot.complete
                  ? 'Expediente completo'
                  : 'Expediente en progreso'}
              </p>
            </div>
            <p className="mt-1.5 text-[8px] leading-4 text-slate-500">
              {snapshot.complete
                ? 'Las etapas principales tienen resolución y el historial conserva sus vínculos.'
                : `${snapshot.completedStages} de ${snapshot.stages.length} etapas principales tienen una resolución terminal.`}
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
              <div>
                <p className="text-[7px] font-medium text-slate-400">Eventos</p>
                <p className="mt-0.5 text-[14px] font-bold text-slate-950">
                  {data.timeline.length}
                </p>
              </div>
              <div>
                <p className="text-[7px] font-medium text-slate-400">Documentos</p>
                <p className="mt-0.5 text-[14px] font-bold text-slate-950">
                  {data.documents.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/45 px-4 py-2.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Estado por etapa
          </p>
          <div className="mt-0.5 flex items-center justify-between gap-3">
            <h2 className="text-[11px] font-semibold text-slate-950">
              Lectura completa del flujo
            </h2>
            <p className="text-[8px] text-slate-400">
              {data.qualityInspections.length} inspecciones ·{' '}
              {data.nonConformities.length} NC
              {openNonConformities > 0
                ? ` · ${openNonConformities} abiertas`
                : closedNonConformities > 0
                  ? ` · ${closedNonConformities} cerradas`
                  : ''}
            </p>
          </div>
        </div>

        <div className="grid divide-y divide-slate-100 sm:grid-cols-5 sm:divide-x sm:divide-y-0">
          {snapshot.stages.map((stage) => (
            <div key={stage.label} className="px-3 py-3">
              <p className="text-[8px] font-medium text-slate-400">
                {stage.label}
              </p>
              <div className="mt-1.5">
                <Badge tone={stage.tone} className="px-2 py-0.5 text-[8px]">
                  {stage.value}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
