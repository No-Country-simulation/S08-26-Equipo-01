import { useMemo, useState } from 'react'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type {
  RoutingOperationDto,
  RoutingSheetDto,
  WorkOrderStatus,
} from '../types/workOrder.types'
import type {
  ReopenRoutingFormValues,
  RoutingOperationFormValues,
} from '../schemas/workOrderPreparation.schemas'
import { ReopenRoutingDialog } from './ReopenRoutingDialog'
import { RoutingFlowView } from './RoutingFlowView'
import { RoutingOperationDialog } from './RoutingOperationDialog'
import { RoutingOperationsList } from './RoutingOperationsList'

interface PendingState {
  create: boolean
  operation: boolean
  approve: boolean
  reopen: boolean
  release: boolean
}

interface WorkOrderRoutingCardProps {
  routing?: RoutingSheetDto
  workOrderStatus: WorkOrderStatus
  pinnedDocumentCount: number
  planningReady: boolean
  canDesign: boolean
  pending: PendingState
  error: unknown
  onAdd: (values: RoutingOperationFormValues) => Promise<boolean>
  onUpdate: (
    operationId: number,
    values: RoutingOperationFormValues,
  ) => Promise<boolean>
  onRemove: (operationId: number) => Promise<void>
  onApprove: () => Promise<void>
  onReopen: (values: ReopenRoutingFormValues) => Promise<boolean>
  onRelease: () => Promise<void>
}

const statusTone = {
  DRAFT: 'neutral',
  APPROVED: 'warning',
  RELEASED: 'success',
} as const

const statusLabel = {
  DRAFT: 'Borrador',
  APPROVED: 'Aprobada',
  RELEASED: 'Liberada',
} as const

function formatEstimatedHours(minutes: number) {
  const hours = minutes / 60
  const formatted = new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 1,
  }).format(hours)

  return `${formatted} h estimadas`
}

export function WorkOrderRoutingCard({
  routing,
  workOrderStatus,
  pinnedDocumentCount,
  planningReady,
  canDesign,
  pending,
  error,
  onAdd,
  onUpdate,
  onRemove,
  onApprove,
  onReopen,
  onRelease,
}: WorkOrderRoutingCardProps) {
  const [operation, setOperation] = useState<RoutingOperationDto | null>(null)
  const [operationDialogOpen, setOperationDialogOpen] = useState(false)
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'flow' | 'list'>('flow')

  const nextSequence = useMemo(() => {
    if (!routing || routing.operations.length === 0) return 1
    return (
      Math.max(...routing.operations.map((item) => item.sequenceNumber)) + 1
    )
  }, [routing])

  const openCreateOperation = () => {
    setOperation(null)
    setOperationDialogOpen(true)
  }

  const openEditOperation = (item: RoutingOperationDto) => {
    setOperation(item)
    setOperationDialogOpen(true)
  }

  if (!routing) {
    const canAddFirstOperation =
      canDesign && workOrderStatus === 'CREATED' && pinnedDocumentCount > 0

    return (
      <>
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
          <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                03 · Hoja de ruta
              </p>
              <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
                Ruta de producción
              </h2>
            </div>

            {canAddFirstOperation ? (
              <Button
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={openCreateOperation}
                disabled={pending.create || pending.operation}
              >
                {pending.create || pending.operation
                  ? 'Guardando…'
                  : 'Agregar primera operación'}
              </Button>
            ) : null}
          </div>

          <div className="px-4 py-3">
            <p className="text-[8px] leading-4 text-slate-500">
              Registra la primera operación y QualityTrack creará la hoja de
              ruta automáticamente. Después podrás continuar agregando las
              siguientes etapas del proceso.
            </p>

            <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-3 py-2.5 text-[8px] leading-4 text-slate-500">
              {pinnedDocumentCount === 0
                ? 'Fija al menos una versión documental para comenzar la ruta de producción.'
                : canDesign
                  ? 'La primera operación abrirá la ruta. Máquina, operador y tiempos reales se registran durante Producción.'
                  : 'Ingeniería o Administración deben definir las operaciones antes de liberar la orden.'}
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
              >
                {getErrorMessage(error)}
              </p>
            ) : null}
          </div>
        </section>

        <RoutingOperationDialog
          open={operationDialogOpen}
          operations={[]}
          nextSequence={1}
          submitting={pending.create || pending.operation}
          error={error}
          onClose={() => setOperationDialogOpen(false)}
          onSubmit={async (values) => {
            const created = await onAdd(values)
            if (created) setOperationDialogOpen(false)
            return created
          }}
        />
      </>
    )
  }

  const editable = routing.status === 'DRAFT' && canDesign
  const canApprove =
    editable && routing.operations.length > 0 && pinnedDocumentCount > 0
  const canRelease =
    routing.status === 'APPROVED' &&
    canDesign &&
    workOrderStatus === 'CREATED' &&
    planningReady

  return (
    <section
      id={`routing-sheet-${routing.id}`}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)] target:ring-2 target:ring-blue-200"
    >
      <div className="flex flex-col gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            03 · Hoja de ruta
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h2 className="text-[11px] font-semibold text-slate-950">
              Ruta de producción · Rev {routing.revision}
            </h2>
            <Badge
              tone={statusTone[routing.status]}
              className="px-2 py-0.5 text-[8px]"
            >
              {statusLabel[routing.status]}
            </Badge>
          </div>
          <p className="mt-0.5 text-[8px] text-slate-400">
            {routing.operations.length} operaciones ·{' '}
            {formatEstimatedHours(routing.totalEstimatedMinutes)}
          </p>
        </div>

        {editable ? (
          <Button
            size="sm"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={openCreateOperation}
          >
            Agregar operación
          </Button>
        ) : null}
      </div>

      <div className="px-4 py-3">
        {error ? (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
            {getErrorMessage(error)}
          </p>
        ) : null}

        {routing.operations.length > 0 ? (
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[8px] font-semibold text-slate-800">
                Flujo de fabricación
              </p>
              <p className="mt-0.5 text-[7px] text-slate-400">
                Las conexiones muestran qué operaciones deben terminar antes de
                habilitar la siguiente.
              </p>
            </div>
            <div className="inline-flex w-fit rounded-md border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('flow')}
                className={
                  viewMode === 'flow'
                    ? '!h-7 rounded-md bg-white !px-2.5 !py-0 !text-[8px] font-semibold !leading-none text-blue-700 shadow-sm'
                    : '!h-7 rounded-md !px-2.5 !py-0 !text-[8px] font-semibold !leading-none text-slate-500 hover:text-slate-800'
                }
              >
                Proceso
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={
                  viewMode === 'list'
                    ? '!h-7 rounded-md bg-white !px-2.5 !py-0 !text-[8px] font-semibold !leading-none text-blue-700 shadow-sm'
                    : '!h-7 rounded-md !px-2.5 !py-0 !text-[8px] font-semibold !leading-none text-slate-500 hover:text-slate-800'
                }
              >
                Operaciones
              </button>
            </div>
          </div>
        ) : null}

        {viewMode === 'flow' && routing.operations.length > 0 ? (
          <RoutingFlowView operations={routing.operations} />
        ) : (
          <RoutingOperationsList
            operations={routing.operations}
            editable={editable}
            removing={pending.operation}
            onEdit={openEditOperation}
            onRemove={onRemove}
          />
        )}

        {routing.status === 'DRAFT' ? (
          <div className="mt-3 flex flex-col gap-2.5 rounded-lg border border-amber-200 bg-amber-50/65 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-semibold text-amber-900">
                Revisión en preparación
              </p>
              <p className="mt-0.5 text-[8px] leading-4 text-amber-700">
                Aprobar congela operaciones, dependencias y versiones
                documentales fijadas.
              </p>
            </div>
            {canDesign ? (
              <Button
                size="sm"
                className="!h-7 !px-2.5 !text-[8px]"
                disabled={!canApprove || pending.approve}
                onClick={() => void onApprove()}
              >
                {pending.approve ? 'Aprobando…' : 'Aprobar hoja de ruta'}
              </Button>
            ) : null}
          </div>
        ) : null}

        {routing.status === 'APPROVED' ? (
          <div className="mt-3 flex flex-col gap-2.5 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[9px] font-semibold text-blue-900">
                Ruta aprobada
              </p>
              <p className="mt-0.5 text-[8px] leading-4 text-blue-700">
                {planningReady
                  ? 'Libérala para iniciar Producción o reábrela si requiere corrección.'
                  : 'Completa las fechas de planificación antes de liberar la ruta a Producción.'}
              </p>
            </div>
            {canDesign ? (
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="secondary"
                  className="!h-7 !px-2.5 !text-[8px]"
                  disabled={pending.reopen}
                  onClick={() => setReopenDialogOpen(true)}
                >
                  Reabrir
                </Button>
                <Button
                  size="sm"
                  className="!h-7 !px-2.5 !text-[8px]"
                  disabled={!canRelease || pending.release}
                  onClick={() => void onRelease()}
                >
                  {pending.release ? 'Liberando…' : 'Liberar a producción'}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        {routing.status === 'RELEASED' ? (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/65 px-3 py-2.5">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <div>
              <p className="text-[9px] font-semibold text-emerald-900">
                Ruta liberada e histórica
              </p>
              <p className="mt-0.5 text-[8px] leading-4 text-emerald-700">
                Esta revisión ya no puede modificarse ni reabrirse.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <RoutingOperationDialog
        open={operationDialogOpen}
        operation={operation ?? undefined}
        operations={routing.operations}
        nextSequence={nextSequence}
        submitting={pending.operation}
        error={error}
        onClose={() => {
          setOperationDialogOpen(false)
          setOperation(null)
        }}
        onSubmit={async (values) => {
          const success = operation
            ? await onUpdate(operation.id, values)
            : await onAdd(values)

          if (success) {
            setOperationDialogOpen(false)
            setOperation(null)
          }
          return success
        }}
      />

      <ReopenRoutingDialog
        open={reopenDialogOpen}
        submitting={pending.reopen}
        error={error}
        onClose={() => setReopenDialogOpen(false)}
        onSubmit={async (values) => {
          const success = await onReopen(values)
          if (success) setReopenDialogOpen(false)
          return success
        }}
      />
    </section>
  )
}
