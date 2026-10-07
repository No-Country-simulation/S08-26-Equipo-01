import { Link } from 'react-router-dom'
import type {
  TraceabilityActionDto,
  TraceabilityEventDto,
  WorkOrder360Dto,
} from '../types/workOrder360.types'

interface WorkOrderTraceabilityProps {
  data: WorkOrder360Dto
}

const eventLabels: Record<string, string> = {
  WORK_ORDER_CREATED: 'Orden de trabajo creada',
  WORK_ORDER_PLANNING_UPDATED: 'Planificación actualizada',
  WORK_ORDER_DOCUMENT_PINNED: 'Documento fijado a la orden',
  WORK_ORDER_MATERIAL_PLANNED: 'Material previsto definido',
  WORK_ORDER_MATERIAL_PLAN_REMOVED: 'Material previsto retirado',
  ROUTING_SHEET_CREATED: 'Hoja de ruta creada',
  ROUTING_OPERATION_ADDED: 'Operación agregada a la ruta',
  ROUTING_OPERATION_UPDATED: 'Operación actualizada',
  ROUTING_OPERATION_REMOVED: 'Operación retirada',
  ROUTING_SHEET_APPROVED: 'Hoja de ruta aprobada',
  ROUTING_SHEET_REOPENED: 'Hoja de ruta reabierta',
  ROUTING_SHEET_RELEASED: 'Hoja de ruta liberada',
  WORK_ORDER_RELEASED: 'Orden liberada a Producción',
  PRODUCTION_STARTED: 'Producción iniciada',
  OPERATION_EXECUTION_STARTED: 'Operación iniciada',
  OPERATION_EXECUTION_COMPLETED: 'Operación completada',
  OPERATION_EXECUTION_CANCELLED: 'Ejecución cancelada',
  WORK_ORDER_MATERIAL_RECORDED: 'Consumo de material registrado',
  PRODUCTION_COMPLETED: 'Producción completada',
  QUALITY_HANDOFF: 'Orden enviada a Calidad',
  QUALITY_INSPECTION_CREATED: 'Inspección de calidad creada',
  QUALITY_INSPECTION_STARTED: 'Inspección iniciada',
  QUALITY_CHECK_RECORDED: 'Control de calidad registrado',
  QUALITY_CHECK_UPDATED: 'Control de calidad actualizado',
  QUALITY_INSPECTION_APPROVED: 'Inspección aprobada',
  QUALITY_INSPECTION_REJECTED: 'Inspección rechazada',
  WORK_ORDER_QUALITY_APPROVED: 'Calidad aprobada',
  WORK_ORDER_QUALITY_REJECTED: 'Calidad rechazada',
  NON_CONFORMITY_OPENED: 'No conformidad abierta',
  NON_CONFORMITY_CLOSED: 'No conformidad cerrada',
  DELIVERY_CREATED: 'Entrega creada',
  DELIVERY_DISPATCHED: 'Entrega despachada',
  DELIVERY_EVIDENCE_ATTACHED: 'Evidencia de entrega adjuntada',
  DELIVERY_DELIVERED: 'Entrega confirmada',
  WORK_ORDER_DELIVERED: 'Orden entregada',
}

function eventLabel(eventType: string): string {
  if (eventLabels[eventType]) return eventLabels[eventType]

  const normalized = eventType.toLocaleLowerCase('es-MX').replaceAll('_', ' ')
  return normalized.replace(/^./, (character) =>
    character.toLocaleUpperCase('es-MX'),
  )
}

function formatStatus(value: string | null): string {
  if (!value) return '—'

  const normalized = value.toLocaleLowerCase('es-MX').replaceAll('_', ' ')
  return normalized.replace(/^./, (character) =>
    character.toLocaleUpperCase('es-MX'),
  )
}

function formatDateTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function detailNumber(event: TraceabilityEventDto, key: string): number | null {
  const value = event.snapshot.details[key]
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function actionHref(
  action: TraceabilityActionDto,
  event: TraceabilityEventDto,
  data: WorkOrder360Dto,
): string | null {
  const workOrderId = data.workOrder.id
  const caseId = data.workOrder.source.caseId
  const routingPurpose = event.snapshot.details.routingPurpose
  const rework = routingPurpose === 'REWORK'
  const workOrderHref = (
    view: 'preparation' | 'production' | 'quality' | 'delivery' | 'documents',
    anchor?: string,
  ) =>
    `/work-orders/${workOrderId}?view=${view}${anchor ? `#${anchor}` : ''}`

  switch (action.type) {
    case 'VIEW_CUSTOMER_REQUEST':
      return `/job-cases/${caseId}#request-source`
    case 'VIEW_JOB_CASE':
      return `/job-cases/${action.resourceId}`
    case 'VIEW_QUOTATION':
      return `/quotations/${action.resourceId}`
    case 'VIEW_WORK_ORDER':
      return action.resourceId === workOrderId
        ? `/work-orders/${workOrderId}?view=summary`
        : `/work-orders/${action.resourceId}`
    case 'VIEW_ROUTING_SHEET':
      return workOrderHref(
        rework ? 'quality' : 'preparation',
        `routing-sheet-${action.resourceId}`,
      )
    case 'VIEW_ROUTING_OPERATION':
      return workOrderHref(
        rework ? 'quality' : 'preparation',
        `routing-operation-${action.resourceId}`,
      )
    case 'VIEW_OPERATION_EXECUTION':
      return workOrderHref(
        rework ? 'quality' : 'production',
        `operation-execution-${action.resourceId}`,
      )
    case 'VIEW_DOCUMENT':
      return workOrderHref('documents', `document-${action.resourceId}`)
    case 'VIEW_DOCUMENT_VERSION': {
      const documentId = detailNumber(event, 'documentId')
      return workOrderHref(
        'documents',
        documentId === null ? undefined : `document-${documentId}`,
      )
    }
    case 'VIEW_MATERIAL_LOT':
      return workOrderHref('production', `material-lot-${action.resourceId}`)
    case 'VIEW_QUALITY_INSPECTION':
      return workOrderHref('quality', `quality-inspection-${action.resourceId}`)
    case 'VIEW_QUALITY_MEASUREMENT':
    case 'VIEW_QUALITY_CHECK':
      return workOrderHref('quality', `quality-check-${action.resourceId}`)
    case 'VIEW_NON_CONFORMITY':
      return workOrderHref('quality', `non-conformity-${action.resourceId}`)
    case 'VIEW_DELIVERY':
      return workOrderHref('delivery', `delivery-${action.resourceId}`)
    default:
      return null
  }
}

export function WorkOrderTraceability({ data }: WorkOrderTraceabilityProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Trazabilidad de la orden
          </p>
          <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
            Historial conectado del proceso
          </h2>
          <p className="mt-1 text-[8px] leading-4 text-slate-500">
            Cada evento conserva el estado, el actor y accesos al recurso relacionado.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[7px] font-semibold text-slate-500">
          {data.timeline.length} eventos
        </span>
      </div>

      {data.timeline.length === 0 ? (
        <div className="px-4 py-6 text-center text-[8px] text-slate-400">
          Todavía no hay eventos de trazabilidad para esta orden.
        </div>
      ) : (
        <div className="relative space-y-2.5 p-4 pl-9 before:absolute before:bottom-7 before:left-[21px] before:top-7 before:w-px before:bg-slate-200">
          {data.timeline.map((event) => {
            const fromStatus = event.snapshot.fromStatus
            const toStatus = event.snapshot.toStatus
            const actions = event.actions
              .map((action) => ({
                action,
                href: actionHref(action, event, data),
              }))
              .filter(
                (
                  item,
                ): item is { action: TraceabilityActionDto; href: string } =>
                  item.href !== null,
              )

            return (
              <article
                key={event.id}
                className="relative rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition hover:border-slate-300"
              >
                <span className="absolute -left-[25px] top-3.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-white" />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[9.5px] font-semibold text-slate-950">
                      {eventLabel(event.eventType)}
                    </h3>
                    <p className="mt-0.5 text-[7px] text-slate-400">
                      {event.performedByName ?? 'Sistema'} · {event.aggregateType}
                    </p>

                    {fromStatus || toStatus ? (
                      <p className="mt-1.5 text-[7.5px] font-medium text-slate-500">
                        {formatStatus(fromStatus)} → {formatStatus(toStatus)}
                      </p>
                    ) : null}

                    {actions.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {actions.slice(0, 3).map(({ action, href }, index) => (
                          <Link
                            key={`${action.type}-${action.resourceId}`}
                            to={href}
                            className={
                              index === 0
                                ? 'inline-flex h-7 items-center rounded-lg bg-blue-600 px-2.5 text-[7.5px] font-semibold text-white transition hover:bg-blue-700'
                                : 'inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[7.5px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                            }
                          >
                            {action.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <time className="shrink-0 text-[7px] text-slate-400">
                    {formatDateTime(event.occurredAt)}
                  </time>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
