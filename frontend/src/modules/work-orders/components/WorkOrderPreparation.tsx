import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useWorkOrderPreparationMutations } from '../hooks/useWorkOrderPreparationMutations'
import type {
  ReopenRoutingFormValues,
  RoutingOperationFormValues,
  WorkOrderPlanningFormValues,
} from '../schemas/workOrderPreparation.schemas'
import type { WorkOrder360Dto } from '../types/workOrder360.types'
import { WorkOrderPinnedDocuments } from './WorkOrderPinnedDocuments'
import { WorkOrderPlanningCard } from './WorkOrderPlanningCard'
import { WorkOrderRoutingCard } from './WorkOrderRoutingCard'

interface WorkOrderPreparationProps {
  data: WorkOrder360Dto
}

type DetailPanel = 'documents' | 'routing' | null

function getMaterialLabel(data: WorkOrder360Dto): string {
  const specification = data.workOrder.source.materialSpecification

  if (specification && typeof specification === 'object') {
    const value = specification as Record<string, unknown>
    const materialName =
      typeof value.materialName === 'string' ? value.materialName : null
    const standardOrGrade =
      typeof value.standardOrGrade === 'string' ? value.standardOrGrade : null
    const parts = [materialName, standardOrGrade].filter(Boolean)

    if (parts.length > 0) return parts.join(' / ')
  }

  return (
    data.workOrder.source.materialRequirement?.trim() ||
    'Material pendiente de especificación'
  )
}

function Requirement({
  complete,
  label,
  detail,
}: {
  complete: boolean
  label: string
  detail: string
}) {
  return (
    <div className="flex gap-3">
      <span
        className={
          complete
            ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-700'
            : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[9px] font-bold text-slate-400'
        }
      >
        {complete ? '✓' : '○'}
      </span>
      <div>
        <p className="text-[9px] font-semibold text-slate-900">{label}</p>
        <p className="mt-0.5 text-[7px] leading-3.5 text-slate-400">{detail}</p>
      </div>
    </div>
  )
}

export function WorkOrderPreparation({ data }: WorkOrderPreparationProps) {
  const session = useSessionStore((state) => state.session)
  const location = useLocation()
  const mutations = useWorkOrderPreparationMutations(data.workOrder.id)
  const documentPanelRef = useRef<HTMLDivElement | null>(null)
  const routingPanelRef = useRef<HTMLDivElement | null>(null)
  const [detailPanel, setDetailPanel] = useState<DetailPanel>(() => {
    if (location.hash.startsWith('#routing-')) return 'routing'
    if (location.hash.startsWith('#document-')) return 'documents'
    return null
  })

  useEffect(() => {
    if (location.hash.startsWith('#routing-')) {
      setDetailPanel('routing')
    } else if (location.hash.startsWith('#document-')) {
      setDetailPanel('documents')
    }
  }, [location.hash])

  useEffect(() => {
    if (detailPanel !== 'documents') return

    const frame = window.requestAnimationFrame(() => {
      documentPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [detailPanel])

  useEffect(() => {
    if (detailPanel !== 'routing') return

    const frame = window.requestAnimationFrame(() => {
      routingPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [detailPanel])
  const roles = session?.user.roles ?? []
  const canPlan =
    roles.includes('ADMIN') ||
    roles.includes('COMMERCIAL') ||
    roles.includes('ENGINEERING')
  const canDesign = roles.includes('ADMIN') || roles.includes('ENGINEERING')
  const productionRouting = data.routingSheets.find(
    (routing) => routing.purpose === 'PRODUCTION',
  )
  const documentsEditable =
    canPlan &&
    data.workOrder.status === 'CREATED' &&
    (!productionRouting || productionRouting.status === 'DRAFT')

  const clearRoutingErrors = () => {
    mutations.createRouting.reset()
    mutations.addOperation.reset()
    mutations.updateOperation.reset()
    mutations.removeOperation.reset()
    mutations.approveRouting.reset()
    mutations.reopenRouting.reset()
    mutations.releaseRouting.reset()
  }

  const routingError =
    mutations.createRouting.error ??
    mutations.addOperation.error ??
    mutations.updateOperation.error ??
    mutations.removeOperation.error ??
    mutations.approveRouting.error ??
    mutations.reopenRouting.error ??
    mutations.releaseRouting.error

  const savePlanning = async (values: WorkOrderPlanningFormValues) => {
    try {
      await mutations.planning.mutateAsync(values)
      return true
    } catch {
      return false
    }
  }

  const pinDocument = async (documentId: number, versionId: number) => {
    try {
      await mutations.pinDocument.mutateAsync({ documentId, versionId })
    } catch {
      // The normalized API error is rendered by the document card.
    }
  }

  const createRouting = async () => {
    clearRoutingErrors()
    try {
      await mutations.createRouting.mutateAsync()
    } catch {
      // The normalized API error is rendered by the routing card.
    }
  }

  const addOperation = async (values: RoutingOperationFormValues) => {
    if (!productionRouting) return false
    clearRoutingErrors()
    try {
      await mutations.addOperation.mutateAsync({
        routingSheetId: productionRouting.id,
        payload: values,
      })
      return true
    } catch {
      return false
    }
  }

  const updateOperation = async (
    operationId: number,
    values: RoutingOperationFormValues,
  ) => {
    if (!productionRouting) return false
    clearRoutingErrors()
    try {
      await mutations.updateOperation.mutateAsync({
        routingSheetId: productionRouting.id,
        operationId,
        payload: values,
      })
      return true
    } catch {
      return false
    }
  }

  const removeOperation = async (operationId: number) => {
    if (!productionRouting) return
    clearRoutingErrors()
    try {
      await mutations.removeOperation.mutateAsync({
        routingSheetId: productionRouting.id,
        operationId,
      })
    } catch {
      // The normalized API error is rendered by the routing card.
    }
  }

  const approveRouting = async () => {
    if (!productionRouting) return
    clearRoutingErrors()
    try {
      await mutations.approveRouting.mutateAsync(productionRouting.id)
    } catch {
      // The normalized API error is rendered by the routing card.
    }
  }

  const reopenRouting = async (values: ReopenRoutingFormValues) => {
    if (!productionRouting) return false
    clearRoutingErrors()
    try {
      await mutations.reopenRouting.mutateAsync({
        routingSheetId: productionRouting.id,
        payload: values,
      })
      return true
    } catch {
      return false
    }
  }

  const releaseRouting = async () => {
    if (!productionRouting) return
    clearRoutingErrors()
    try {
      await mutations.releaseRouting.mutateAsync(productionRouting.id)
    } catch {
      // The normalized API error is rendered by the routing card.
    }
  }

  const planningReady =
    Boolean(data.workOrder.plannedQuantity) &&
    Boolean(data.workOrder.plannedStartDate) &&
    Boolean(data.workOrder.plannedEndDate)
  const documentsReady = data.workOrder.pinnedDocuments.length > 0
  const routingReady = productionRouting?.status === 'RELEASED'
  const readyForProduction = planningReady && documentsReady && routingReady

  const caseDocuments = data.documents.filter(
    ({ document }) => document.caseId !== null,
  )
  const pinnedDocument =
    data.workOrder.pinnedDocuments.find((document) =>
      /PLAN|DRAW|TECH/i.test(document.documentType),
    ) ?? data.workOrder.pinnedDocuments.at(0)
  const availableDocument = caseDocuments.at(0)?.document

  const documentSummary = pinnedDocument
    ? `${pinnedDocument.documentName} · v${pinnedDocument.version} fijada`
    : availableDocument
      ? `${availableDocument.name} · v${availableDocument.currentVersion.version} disponible`
      : 'Sin documento disponible'

  const routingSummary = !productionRouting
    ? 'Pendiente'
    : productionRouting.status === 'DRAFT'
      ? `Borrador · ${productionRouting.operations.length} operaciones`
      : productionRouting.status === 'APPROVED'
        ? 'Aprobada · pendiente liberar'
        : `Liberada · ${productionRouting.operations.length} operaciones`

  return (
    <div className="space-y-3">
      {!session ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] leading-4 text-red-700">
          {getErrorMessage(new Error('No hay una sesión interna disponible.'))}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)] lg:items-stretch">
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Planificación operativa
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Preparar la orden para producción
            </h2>
            <p className="mt-1 text-[8px] leading-4 text-slate-500">
              La fabricación debe quedar cerrada antes de la entrega comprometida.
            </p>
          </div>

          <WorkOrderPlanningCard
            workOrder={data.workOrder}
            canEdit={canPlan && data.workOrder.status === 'CREATED'}
            saving={mutations.planning.isPending}
            error={mutations.planning.error}
            onSave={savePlanning}
          />

          <div className="rounded-xl border border-blue-100 bg-blue-50/55 px-3.5 py-3">
            <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-blue-600">
              Material definido en expediente
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-900">
              {getMaterialLabel(data)} ·{' '}
              {data.workOrder.plannedQuantity ?? data.workOrder.source.quantity}{' '}
              piezas
            </p>
            <p className="mt-1 text-[7px] leading-3.5 text-slate-500">
              Los lotes y consumos se registrarán durante la ejecución de producción.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <section
              className={
                detailPanel === 'documents'
                  ? 'rounded-xl border border-blue-200 bg-blue-50/25 px-3.5 py-3 sm:col-span-2'
                  : 'rounded-xl border border-slate-200 bg-slate-50/45 px-3.5 py-3'
              }
            >
              <p
                className={
                  documentsReady
                    ? 'text-[7px] font-bold uppercase tracking-[0.1em] text-emerald-700'
                    : 'text-[7px] font-bold uppercase tracking-[0.1em] text-amber-600'
                }
              >
                {documentsReady
                  ? 'Documento de fabricación'
                  : 'Documentación pendiente'}
              </p>
              <p className="mt-1.5 text-[9px] font-semibold text-slate-900">
                {documentSummary}
              </p>
              <p className="mt-1 text-[7px] leading-3.5 text-slate-400">
                Se fija una versión concreta para preservar la trazabilidad.
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3 !h-7 !px-2.5 !text-[8px]"
                onClick={() =>
                  setDetailPanel((current) =>
                    current === 'documents' ? null : 'documents',
                  )
                }
              >
                {detailPanel === 'documents'
                  ? 'Ocultar documentos'
                  : documentsReady
                    ? 'Gestionar documento'
                    : 'Vincular documento'}
              </Button>

              {detailPanel === 'documents' ? (
                <div
                  ref={documentPanelRef}
                  className="mt-3 scroll-mt-20 border-t border-blue-100 pt-3"
                >
                  <WorkOrderPinnedDocuments
                    documents={caseDocuments}
                    pinnedDocuments={data.workOrder.pinnedDocuments}
                    canEdit={documentsEditable}
                    saving={mutations.pinDocument.isPending}
                    error={mutations.pinDocument.error}
                    onPin={pinDocument}
                  />
                </div>
              ) : null}
            </section>

            <section className="rounded-xl border border-slate-200 bg-slate-50/45 px-3.5 py-3">
              <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">
                Hoja de ruta
              </p>
              <p className="mt-1.5 text-[9px] font-semibold text-slate-900">
                {routingSummary}
              </p>
              <p className="mt-1 text-[7px] leading-3.5 text-slate-400">
                Define y congela las operaciones que ejecutará Producción.
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3 !h-7 !px-2.5 !text-[8px]"
                onClick={() =>
                  setDetailPanel((current) =>
                    current === 'routing' ? null : 'routing',
                  )
                }
              >
                {detailPanel === 'routing'
                  ? 'Ocultar hoja de ruta'
                  : productionRouting
                    ? 'Gestionar hoja de ruta'
                    : 'Preparar hoja de ruta'}
              </Button>
            </section>
          </div>
        </section>

        <aside className="flex h-full flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Preparación para producción
            </p>
            <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
              Requisitos para liberar la OT
            </h2>
          </div>

          <div className="mt-5 space-y-5">
            <Requirement
              complete={planningReady}
              label="Fechas planeadas"
              detail={
                planningReady
                  ? 'Planificación operativa completa'
                  : 'Define inicio y fin planeados'
              }
            />
            <Requirement
              complete={documentsReady}
              label="Documento de fabricación"
              detail={
                documentsReady
                  ? 'Versión concreta fijada para la OT'
                  : 'Falta fijar una versión documental'
              }
            />
            <Requirement
              complete={routingReady}
              label="Hoja de ruta liberada"
              detail={
                routingReady
                  ? 'Aprobada y liberada a Producción'
                  : productionRouting?.status === 'APPROVED'
                    ? 'Aprobada, pendiente de liberar'
                    : 'La ruta aún no está cerrada'
              }
            />
          </div>

          <div
            className={
              readyForProduction
                ? 'mt-auto rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-3'
                : 'mt-auto rounded-xl border border-blue-100 bg-blue-50/55 px-3 py-3'
            }
          >
            <p
              className={
                readyForProduction
                  ? 'text-[8px] font-semibold text-emerald-900'
                  : 'text-[8px] font-semibold text-blue-900'
              }
            >
              {readyForProduction
                ? 'Paquete operativo completo'
                : 'Todavía hay requisitos pendientes'}
            </p>
            <p
              className={
                readyForProduction
                  ? 'mt-1 text-[7px] leading-3.5 text-emerald-800'
                  : 'mt-1 text-[7px] leading-3.5 text-blue-800'
              }
            >
              {readyForProduction
                ? 'La orden puede avanzar a producción conforme a las reglas del backend.'
                : 'READY_FOR_PRODUCTION aparece cuando planificación, documentos y routing están cerrados.'}
            </p>
          </div>
        </aside>
      </div>

      {detailPanel === 'routing' ? (
        <div ref={routingPanelRef} className="scroll-mt-20">
          <WorkOrderRoutingCard
          routing={productionRouting}
          workOrderStatus={data.workOrder.status}
          pinnedDocumentCount={data.workOrder.pinnedDocuments.length}
          planningReady={planningReady}
          canDesign={canDesign}
          pending={{
            create: mutations.createRouting.isPending,
            operation:
              mutations.addOperation.isPending ||
              mutations.updateOperation.isPending ||
              mutations.removeOperation.isPending,
            approve: mutations.approveRouting.isPending,
            reopen: mutations.reopenRouting.isPending,
            release: mutations.releaseRouting.isPending,
          }}
          error={routingError}
          onCreate={createRouting}
          onAdd={addOperation}
          onUpdate={updateOperation}
          onRemove={removeOperation}
          onApprove={approveRouting}
          onReopen={reopenRouting}
          onRelease={releaseRouting}
        />
        </div>
      ) : null}
    </div>
  )
}
