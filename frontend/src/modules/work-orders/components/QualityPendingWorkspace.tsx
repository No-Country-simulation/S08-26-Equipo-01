import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { formatQualityDateTime } from '../model/qualityPresenter'
import type { QualityInspectionDto } from '../types/quality.types'
import type {
  OperationExecutionDto,
  RoutingSheetDto,
  WorkOrderDocumentDto,
} from '../types/workOrder.types'
import type { WorkOrder360MaterialDto } from '../types/workOrder360.types'

interface QualityPendingWorkspaceProps {
  inspection: QualityInspectionDto
  productionRouting: RoutingSheetDto | null
  executions: OperationExecutionDto[]
  plannedQuantity: number | null
  pinnedDocuments: WorkOrderDocumentDto[]
  materials: WorkOrder360MaterialDto[]
  canStart: boolean
  starting: boolean
  onStart: () => void
}

export function QualityPendingWorkspace({
  inspection,
  productionRouting,
  executions,
  plannedQuantity,
  pinnedDocuments,
  materials,
  canStart,
  starting,
  onStart,
}: QualityPendingWorkspaceProps) {
  const operations = [...(productionRouting?.operations ?? [])].sort(
    (left, right) => left.sequenceNumber - right.sequenceNumber,
  )
  const completedExecutions = executions.filter(
    (execution) =>
      execution.routingPurpose === 'PRODUCTION' &&
      execution.status === 'COMPLETED' &&
      (!productionRouting || execution.routingSheetId === productionRouting.id),
  )
  const completedByOperation = new Map(
    completedExecutions.map((execution) => [
      execution.routingOperationId,
      execution,
    ]),
  )
  const rejectedDuringProduction = completedExecutions.reduce(
    (total, execution) => total + execution.quantityRejected,
    0,
  )
  const primaryDocument = pinnedDocuments.at(0) ?? null
  const latestMaterial = materials.at(-1) ?? null
  const inspectionType =
    inspection.reworkNonConformityId === null ? 'FINAL' : 'REINSPECCIÓN'

  const evidenceItems = [
    primaryDocument
      ? {
          label: 'Documento de fabricación',
          value:
            primaryDocument.documentName +
            ' · v' +
            primaryDocument.version,
        }
      : null,
    latestMaterial
      ? {
          label: 'Material consumido',
          value: 'Lote ' + latestMaterial.consumption.lotNumber,
        }
      : null,
    productionRouting
      ? {
          label: 'Hoja de ruta',
          value: 'Routing Rev.' + productionRouting.revision,
        }
      : null,
  ].filter(
    (item): item is { label: string; value: string } => item !== null,
  )

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.75fr)] lg:items-stretch">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-[12px] font-semibold text-slate-950">
            Producción completada
          </h2>
          <p className="mt-1 text-[8px] text-slate-500">
            {operations.length} operaciones
            {plannedQuantity !== null ? ' · ' + plannedQuantity + ' piezas' : ''}
            {' · ' + rejectedDuringProduction + ' rechazadas durante fabricación'}
          </p>
        </div>

        {operations.length > 0 ? (
          <div className="space-y-2.5 p-4">
            {operations.map((operation) => {
              const execution = completedByOperation.get(operation.id)

              return (
                <article
                  id={'routing-operation-' + operation.id}
                  key={operation.id}
                  className="scroll-mt-24 grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/55 px-3.5 py-3 target:ring-2 target:ring-blue-200"
                >
                  <span className="text-[9px] font-semibold text-slate-500">
                    {operation.sequenceNumber}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold text-slate-950">
                      {operation.code} · {operation.name}
                    </p>
                    <p className="mt-1 text-[8px] text-slate-400">
                      {operation.estimatedMinutes} min
                      {execution?.machineCode
                        ? ' · ' + execution.machineCode
                        : ''}
                    </p>
                  </div>

                  <Badge
                    tone={execution ? 'success' : 'neutral'}
                    className="min-w-[92px] justify-center px-3 py-1 text-[7px]"
                  >
                    {execution ? 'COMPLETADA' : 'SIN REGISTRO'}
                  </Badge>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="p-4">
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-5 text-center text-[8px] text-slate-500">
              No encontramos operaciones de producción asociadas a la hoja de
              ruta vigente.
            </p>
          </div>
        )}
      </section>

      <aside
        id={'quality-inspection-' + inspection.id}
        className="scroll-mt-24 flex h-full flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)] target:ring-2 target:ring-blue-200"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[12px] font-semibold text-slate-950">
            {inspectionType === 'FINAL'
              ? 'Inspección final'
              : 'Reinspección de calidad'}
          </h2>
          <Badge tone="info" className="px-3 py-1 text-[7px]">
            PENDIENTE
          </Badge>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/55 px-3 py-3">
          <dl className="grid grid-cols-3 gap-3">
            <div>
              <dt className="text-[7px] text-slate-400">Estado</dt>
              <dd className="mt-1 text-[11px] font-bold text-slate-950">
                PENDING
              </dd>
            </div>
            <div>
              <dt className="text-[7px] text-slate-400">Inspector</dt>
              <dd className="mt-1 text-[11px] font-bold text-slate-950">
                {inspection.inspectorName ?? 'Sin asignar'}
              </dd>
            </div>
            <div>
              <dt className="text-[7px] text-slate-400">Tipo</dt>
              <dd className="mt-1 text-[11px] font-bold text-slate-950">
                {inspectionType}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-[7px] text-slate-400">
            Creada {formatQualityDateTime(inspection.createdAt)}
          </p>
        </div>

        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/55 px-3 py-3">
          <p className="text-[7px] font-semibold text-emerald-700">
            Paquete de evidencia
          </p>

          {evidenceItems.length > 0 ? (
            <div className="mt-2 space-y-1.5">
              {evidenceItems.map((item) => (
                <div key={item.label}>
                  <p className="text-[6.5px] uppercase tracking-[0.06em] text-emerald-700/65">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[8px] font-medium text-slate-700">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-[8px] leading-4 text-slate-600">
              La orden no tiene evidencias operativas adicionales vinculadas.
            </p>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/55 px-3 py-3">
          <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-blue-600">
            Siguiente acción
          </p>
          <p className="mt-1 text-[9px] font-semibold text-slate-950">
            Iniciar inspección y registrar controles
          </p>
          <p className="mt-1 text-[7px] text-slate-500">
            QualityInspection PENDING → IN_PROGRESS
          </p>
        </div>

        <div className="mt-auto pt-4">
          {canStart ? (
            <Button
              className="!h-8 !w-full !justify-center !text-[8px]"
              onClick={onStart}
              disabled={starting}
            >
              {starting ? 'Iniciando…' : 'Iniciar inspección'}
            </Button>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-center text-[7px] leading-3.5 text-slate-500">
              Tu rol puede consultar la inspección, pero no iniciarla.
            </p>
          )}

          <p className="mt-2 text-[7px] leading-3.5 text-slate-400">
            Al iniciar se asignará el inspector y podrás registrar mediciones, verificaciones visuales o pruebas PASS/FAIL.
          </p>
        </div>
      </aside>
    </div>
  )
}
