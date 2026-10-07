import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  executionDurationMinutes,
  formatProductionDateTime,
} from '../model/productionPresenter'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
  WorkOrderStatus,
} from '../types/workOrder.types'

interface ProductionCurrentOperationPanelProps {
  operation: RoutingOperationDto | null
  executions: OperationExecutionDto[]
  unlocked: boolean
  pendingPrerequisiteCodes: string[]
  canExecute: boolean
  productionCompleted: boolean
  workOrderStatus: WorkOrderStatus
  onStart: (operation: RoutingOperationDto) => void
  onComplete: (execution: OperationExecutionDto) => void
  onCancel: (execution: OperationExecutionDto) => void
}

export function ProductionCurrentOperationPanel({
  operation,
  executions,
  unlocked,
  pendingPrerequisiteCodes,
  canExecute,
  productionCompleted,
  workOrderStatus,
  onStart,
  onComplete,
  onCancel,
}: ProductionCurrentOperationPanelProps) {
  if (!operation) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-[8px] leading-4 text-slate-500">
        No hay una operación seleccionada.
      </div>
    )
  }

  const prerequisiteOperationIds = operation.prerequisiteOperationIds ?? []
  const orderedAttempts = [...executions].sort(
    (left, right) => left.attemptNumber - right.attemptNumber,
  )
  const completed = orderedAttempts.find(
    (execution) => execution.status === 'COMPLETED',
  )
  const inProgress = orderedAttempts.find(
    (execution) => execution.status === 'IN_PROGRESS',
  )
  const cancelledCount = orderedAttempts.filter(
    (execution) => execution.status === 'CANCELLED',
  ).length
  const productionOpen =
    workOrderStatus === 'READY_FOR_PRODUCTION' ||
    workOrderStatus === 'IN_PRODUCTION'
  const canStart =
    canExecute &&
    unlocked &&
    productionOpen &&
    !productionCompleted &&
    !completed &&
    !inProgress

  const statusTone = inProgress
    ? 'warning'
    : completed
      ? 'success'
      : !unlocked
        ? 'neutral'
        : 'info'
  const statusLabel = inProgress
    ? 'En ejecución'
    : completed
      ? 'Completada'
      : !unlocked
        ? 'Esperando dependencias'
        : cancelledCount > 0
          ? 'Lista para reintentar'
          : 'Lista para iniciar'

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          {inProgress ? 'Operación en ejecución' : 'Detalle de operación'}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h3 className="text-[13px] font-semibold text-slate-950">
            {operation.sequenceNumber} · {operation.code}
          </h3>
          <Badge tone={statusTone} className="px-2 py-0.5 text-[7px]">
            {statusLabel}
          </Badge>
        </div>
        <p className="mt-1 text-[10px] font-medium text-slate-700">
          {operation.name}
        </p>
        <p className="mt-1 text-[7px] text-slate-400">
          {operation.estimatedMinutes} min estimados
          {cancelledCount > 0
            ? ` · ${cancelledCount} intento${cancelledCount === 1 ? '' : 's'} cancelado${cancelledCount === 1 ? '' : 's'}`
            : ''}
        </p>
      </div>

      {operation.instructions ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/55 px-3 py-2.5">
          <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Instrucciones
          </p>
          <p className="mt-1 text-[8px] leading-4 text-slate-600">
            {operation.instructions}
          </p>
        </div>
      ) : null}

      {inProgress ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50/55 px-3 py-3">
          <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-blue-600">
            Ejecución en curso
          </p>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div>
              <dt className="text-[7px] text-slate-400">Operador</dt>
              <dd className="mt-0.5 text-[8px] font-semibold text-slate-900">
                {inProgress.operatorName ?? 'Usuario actual'}
              </dd>
            </div>
            <div>
              <dt className="text-[7px] text-slate-400">Máquina</dt>
              <dd className="mt-0.5 text-[8px] font-semibold text-slate-900">
                {inProgress.machineCode ?? 'Sin máquina asignada'}
              </dd>
            </div>
            <div>
              <dt className="text-[7px] text-slate-400">Inicio</dt>
              <dd className="mt-0.5 text-[8px] font-semibold text-slate-900">
                {formatProductionDateTime(inProgress.startedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[7px] text-slate-400">Duración</dt>
              <dd className="mt-0.5 text-[8px] font-semibold text-slate-900">
                {executionDurationMinutes(inProgress) ?? 'En curso'}
              </dd>
            </div>
          </dl>
        </div>
      ) : completed ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/55 px-3 py-3">
          <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-emerald-700">
            Resultado registrado
          </p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div>
              <p className="text-[7px] text-slate-400">Procesadas</p>
              <p className="mt-0.5 text-[10px] font-bold text-slate-950">
                {completed.quantityProcessed}
              </p>
            </div>
            <div>
              <p className="text-[7px] text-slate-400">Aceptadas</p>
              <p className="mt-0.5 text-[10px] font-bold text-emerald-700">
                {completed.quantityAccepted}
              </p>
            </div>
            <div>
              <p className="text-[7px] text-slate-400">Rechazadas</p>
              <p className="mt-0.5 text-[10px] font-bold text-red-600">
                {completed.quantityRejected}
              </p>
            </div>
          </div>
        </div>
      ) : !unlocked ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2.5">
          <p className="text-[8px] font-semibold text-amber-900">
            Esta operación todavía no puede iniciar.
          </p>
          <p className="mt-1 text-[7.5px] leading-4 text-amber-700">
            {pendingPrerequisiteCodes.length > 0
              ? `Espera a que finalice: ${pendingPrerequisiteCodes.join(' + ')}.`
              : 'La hoja de ruta debe estar liberada para Producción.'}
          </p>
        </div>
      ) : prerequisiteOperationIds.length === 0 ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/45 px-3 py-2.5 text-[7.5px] text-emerald-700">
          Operación independiente: puede iniciar sin esperar otro paso de la ruta.
        </div>
      ) : null}

      {canStart ? (
        <Button
          className="!h-8 !w-full !justify-center !text-[8px]"
          onClick={() => onStart(operation)}
        >
          {cancelledCount > 0 ? 'Reintentar operación' : 'Iniciar operación'}
        </Button>
      ) : null}

      {inProgress && canExecute ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Button
            className="!h-8 !justify-center !text-[8px]"
            onClick={() => onComplete(inProgress)}
          >
            Finalizar operación
          </Button>
          <Button
            variant="secondary"
            className="!h-8 !justify-center !text-[8px]"
            onClick={() => onCancel(inProgress)}
          >
            Cancelar intento
          </Button>
        </div>
      ) : null}
    </div>
  )
}
