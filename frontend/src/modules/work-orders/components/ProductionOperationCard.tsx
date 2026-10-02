import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  executionDurationMinutes,
  formatProductionDateTime,
  getExecutionPresentation,
} from '../model/productionPresenter'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
  WorkOrderStatus,
} from '../types/workOrder.types'

interface ProductionOperationCardProps {
  operation: RoutingOperationDto
  executions: OperationExecutionDto[]
  workOrderStatus: WorkOrderStatus
  unlocked: boolean
  canExecute: boolean
  productionCompleted: boolean
  onStart: (operation: RoutingOperationDto) => void
  onComplete: (execution: OperationExecutionDto) => void
  onCancel: (execution: OperationExecutionDto) => void
}

export function ProductionOperationCard({
  operation,
  executions,
  workOrderStatus,
  unlocked,
  canExecute,
  productionCompleted,
  onStart,
  onComplete,
  onCancel,
}: ProductionOperationCardProps) {
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
      : cancelledCount > 0
        ? 'danger'
        : 'neutral'

  const statusLabel = inProgress
    ? 'En ejecución'
    : completed
      ? 'Completada'
      : cancelledCount > 0
        ? cancelledCount === 1
          ? '1 intento cancelado'
          : `${cancelledCount} intentos cancelados`
        : !unlocked
          ? 'Bloqueada'
          : 'Pendiente'

  return (
    <article
      id={`routing-operation-${operation.id}`}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-28px_rgba(15,23,42,0.28)] target:ring-2 target:ring-blue-200"
    >
      <div className="flex flex-col gap-3 px-3.5 py-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-2.5">
          <span
            className={
              completed
                ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[9px] font-bold text-emerald-700 ring-1 ring-emerald-100'
                : inProgress
                  ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-[9px] font-bold text-amber-700 ring-1 ring-amber-100'
                  : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-[9px] font-bold text-slate-600 ring-1 ring-slate-200'
            }
          >
            {completed ? '✓' : operation.sequenceNumber}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-[8px] font-bold uppercase tracking-wide text-blue-600">
                {operation.code}
              </p>
              <Badge tone={statusTone} className="px-2 py-0.5 text-[7px]">
                {statusLabel}
              </Badge>
            </div>
            <h3 className="mt-0.5 text-[10px] font-semibold text-slate-950">
              {operation.name}
            </h3>
            <p className="mt-0.5 text-[8px] text-slate-400">
              Estimado · {operation.estimatedMinutes} min
            </p>
            {operation.instructions ? (
              <p className="mt-1 max-w-3xl text-[8px] leading-4 text-slate-500">
                {operation.instructions}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-1.5">
          {canStart ? (
            <Button
              size="sm"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={() => onStart(operation)}
            >
              {cancelledCount > 0 ? 'Reintentar' : 'Iniciar operación'}
            </Button>
          ) : null}

          {inProgress && canExecute ? (
            <>
              <Button
                size="sm"
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={() => onComplete(inProgress)}
              >
                Finalizar
              </Button>
              <Button
                size="sm"
                variant="danger"
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={() => onCancel(inProgress)}
              >
                Cancelar intento
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {!unlocked && !completed ? (
        <p className="border-t border-slate-100 bg-slate-50/60 px-3.5 py-2 text-[8px] text-slate-500">
          Completa la operación anterior para habilitar este paso.
        </p>
      ) : null}

      {orderedAttempts.length > 0 ? (
        <div className="border-t border-slate-100 bg-slate-50/35 px-3.5 py-2.5">
          <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Historial de intentos
          </p>
          <div className="mt-1.5 grid gap-1.5">
            {orderedAttempts.map((execution) => {
              const presentation = getExecutionPresentation(execution.status)
              const duration = executionDurationMinutes(execution)

              return (
                <div
                  id={`operation-execution-${execution.id}`}
                  key={execution.id}
                  className="scroll-mt-24 grid gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[8px] text-slate-500 target:ring-2 target:ring-blue-200 sm:grid-cols-[62px_95px_1fr_1fr_auto]"
                >
                  <span className="font-semibold text-slate-800">
                    Intento {execution.attemptNumber}
                  </span>
                  <Badge tone={presentation.tone} className="px-2 py-0.5 text-[7px]">
                    {presentation.label}
                  </Badge>
                  <span>
                    {execution.operatorName ?? 'Operador'} ·{' '}
                    {execution.machineCode ?? 'Sin máquina'}
                  </span>
                  <span>
                    {formatProductionDateTime(execution.startedAt)}
                    {duration !== null ? ` · ${duration} min` : ''}
                  </span>
                  <span className="font-semibold text-slate-700">
                    {execution.status === 'COMPLETED'
                      ? `${execution.quantityAccepted} OK / ${execution.quantityRejected} rechazadas`
                      : execution.status === 'CANCELLED'
                        ? (execution.cancellationReason ?? 'Cancelada')
                        : 'En curso'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </article>
  )
}
