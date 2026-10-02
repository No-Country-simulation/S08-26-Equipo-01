import { Badge } from '@/shared/components/ui/Badge'
import {
  executionDurationMinutes,
  formatProductionDateTime,
  getExecutionPresentation,
} from '../model/productionPresenter'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
} from '../types/workOrder.types'

interface ProductionRouteListProps {
  operations: RoutingOperationDto[]
  executions: OperationExecutionDto[]
  routingReleased: boolean
  selectedOperationId: number | null
  expandedOperationId: number | null
  onSelect: (operationId: number) => void
  onToggleAttempts: (operationId: number) => void
}

export function ProductionRouteList({
  operations,
  executions,
  routingReleased,
  selectedOperationId,
  expandedOperationId,
  onSelect,
  onToggleAttempts,
}: ProductionRouteListProps) {
  const completedIds = new Set(
    executions
      .filter((execution) => execution.status === 'COMPLETED')
      .map((execution) => execution.routingOperationId),
  )

  return (
    <div className="divide-y divide-slate-100">
      {operations.map((operation, index) => {
        const attempts = executions
          .filter(
            (execution) => execution.routingOperationId === operation.id,
          )
          .sort((left, right) => left.attemptNumber - right.attemptNumber)
        const completed = attempts.find(
          (execution) => execution.status === 'COMPLETED',
        )
        const inProgress = attempts.find(
          (execution) => execution.status === 'IN_PROGRESS',
        )
        const cancelledCount = attempts.filter(
          (execution) => execution.status === 'CANCELLED',
        ).length
        const unlocked =
          routingReleased &&
          operations
            .slice(0, index)
            .every((previous) => completedIds.has(previous.id))
        const selected = selectedOperationId === operation.id

        const tone = inProgress
          ? 'warning'
          : completed
            ? 'success'
            : cancelledCount > 0
              ? 'danger'
              : 'neutral'
        const label = inProgress
          ? 'En ejecución'
          : completed
            ? 'Completada'
            : !unlocked
              ? 'Bloqueada'
              : cancelledCount > 0
                ? 'Lista para reintentar'
                : 'Lista'

        return (
          <article
            id={`routing-operation-${operation.id}`}
            key={operation.id}
            className="scroll-mt-24 target:bg-blue-50/40"
          >
            <button
              type="button"
              onClick={() => onSelect(operation.id)}
              className={
                selected
                  ? 'grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 bg-blue-50/55 px-3 py-3 text-left'
                  : 'grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-left transition hover:bg-slate-50/80'
              }
            >
              <span
                className={
                  completed
                    ? 'flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-bold text-white'
                    : inProgress
                      ? 'flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white'
                      : 'flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[8px] font-bold text-slate-500'
                }
              >
                {completed ? '✓' : operation.sequenceNumber}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-blue-600">
                    {operation.code}
                  </p>
                  <Badge tone={tone} className="px-2 py-0.5 text-[7px]">
                    {label}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-900">
                  {operation.name}
                </p>
                <p className="mt-0.5 text-[7px] text-slate-400">
                  {operation.estimatedMinutes} min estimados
                  {attempts.length > 0
                    ? ` · ${attempts.length} intento${attempts.length === 1 ? '' : 's'}`
                    : ''}
                </p>
              </div>

              <span className="text-[11px] text-slate-300">›</span>
            </button>

            {attempts.length > 0 ? (
              <div className={selected ? 'bg-blue-50/25 px-3 pb-2.5' : 'px-3 pb-2.5'}>
                <button
                  type="button"
                  className="text-[7px] font-semibold text-blue-600 hover:text-blue-800"
                  onClick={() => onToggleAttempts(operation.id)}
                >
                  {expandedOperationId === operation.id
                    ? 'Ocultar historial'
                    : 'Ver historial de intentos'}
                </button>

                {expandedOperationId === operation.id ? (
                  <div className="mt-2 space-y-1.5">
                    {attempts.map((execution) => {
                      const presentation = getExecutionPresentation(
                        execution.status,
                      )
                      const duration = executionDurationMinutes(execution)

                      return (
                        <div
                          id={`operation-execution-${execution.id}`}
                          key={execution.id}
                          className="scroll-mt-24 grid gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[7px] text-slate-500 target:ring-2 target:ring-blue-200 sm:grid-cols-[70px_88px_minmax(0,1fr)_auto]"
                        >
                          <span className="font-semibold text-slate-800">
                            Intento {execution.attemptNumber}
                          </span>
                          <Badge
                            tone={presentation.tone}
                            className="w-fit px-2 py-0.5 text-[6.5px]"
                          >
                            {presentation.label}
                          </Badge>
                          <span className="truncate">
                            {execution.operatorName ?? 'Operador'} ·{' '}
                            {execution.machineCode ?? 'Sin máquina'} ·{' '}
                            {formatProductionDateTime(execution.startedAt)}
                          </span>
                          <span className="font-semibold text-slate-700">
                            {execution.status === 'COMPLETED'
                              ? `${execution.quantityAccepted} OK / ${execution.quantityRejected} rechazadas`
                              : duration !== null
                                ? `${duration} min`
                                : 'En curso'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        )
      })}
    </div>
  )
}
