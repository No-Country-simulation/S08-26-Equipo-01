import { useMemo, useState } from 'react'
import { useSessionStore } from '@/modules/auth'
import { useMachines } from '@/modules/machines'
import { CancelExecutionDialog } from './CancelExecutionDialog'
import { CompleteExecutionDialog } from './CompleteExecutionDialog'
import { ReworkOperationCard } from './ReworkOperationCard'
import { StartOperationDialog } from './StartOperationDialog'
import { useReworkMutations } from '../hooks/useReworkMutations'
import type {
  CancelOperationExecutionFormValues,
  CompleteOperationExecutionFormValues,
  StartOperationExecutionFormValues,
} from '../schemas/production.schemas'
import type { NonConformityDto } from '../types/quality.types'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
  RoutingSheetDto,
  WorkOrderStatus,
} from '../types/workOrder.types'

interface ReworkExecutionPanelProps {
  routing: RoutingSheetDto
  nonConformity: NonConformityDto
  executions: OperationExecutionDto[]
  workOrderStatus: WorkOrderStatus
}

export function ReworkExecutionPanel({
  routing,
  nonConformity,
  executions,
  workOrderStatus,
}: ReworkExecutionPanelProps) {
  const session = useSessionStore((state) => state.session)
  const roles = session?.user.roles ?? []
  const canExecute = roles.includes('ADMIN') || roles.includes('PRODUCTION')
  const executionOpen =
    workOrderStatus === 'QUALITY_HOLD' ||
    workOrderStatus === 'REWORK_IN_PROGRESS'
  const machinesQuery = useMachines(
    canExecute && routing.status === 'RELEASED' && executionOpen,
  )
  const mutations = useReworkMutations()
  const [startOperation, setStartOperation] =
    useState<RoutingOperationDto | null>(null)
  const [activeExecution, setActiveExecution] =
    useState<OperationExecutionDto | null>(null)
  const [dialog, setDialog] = useState<'complete' | 'cancel' | null>(null)

  const routingExecutions = useMemo(
    () =>
      executions.filter(
        (execution) =>
          execution.routingSheetId === routing.id &&
          execution.routingPurpose === 'REWORK',
      ),
    [executions, routing.id],
  )

  const operations = useMemo(
    () =>
      [...routing.operations].sort(
        (left, right) => left.sequenceNumber - right.sequenceNumber,
      ),
    [routing.operations],
  )

  const completedOperationIds = useMemo(
    () =>
      new Set(
        routingExecutions
          .filter((execution) => execution.status === 'COMPLETED')
          .map((execution) => execution.routingOperationId),
      ),
    [routingExecutions],
  )

  const clearErrors = () => {
    mutations.startExecution.reset()
    mutations.completeExecution.reset()
    mutations.cancelExecution.reset()
  }

  const start = async (values: StartOperationExecutionFormValues) => {
    if (!startOperation) return false

    try {
      await mutations.startExecution.mutateAsync({
        operationId: startOperation.id,
        payload: {
          ...(values.machineId ? { machineId: Number(values.machineId) } : {}),
          ...(values.startNotes.trim()
            ? { startNotes: values.startNotes.trim() }
            : {}),
        },
      })
      setStartOperation(null)
      return true
    } catch {
      return false
    }
  }

  const complete = async (values: CompleteOperationExecutionFormValues) => {
    if (!activeExecution) return false

    try {
      await mutations.completeExecution.mutateAsync({
        executionId: activeExecution.id,
        payload: {
          quantityProcessed: values.quantityProcessed,
          quantityAccepted: values.quantityAccepted,
          quantityRejected: values.quantityRejected,
          ...(values.completionNotes.trim()
            ? { completionNotes: values.completionNotes.trim() }
            : {}),
        },
      })
      setDialog(null)
      setActiveExecution(null)
      return true
    } catch {
      return false
    }
  }

  const cancel = async (values: CancelOperationExecutionFormValues) => {
    if (!activeExecution) return false

    try {
      await mutations.cancelExecution.mutateAsync({
        executionId: activeExecution.id,
        payload: {
          cancellationReason: values.cancellationReason.trim(),
        },
      })
      setDialog(null)
      setActiveExecution(null)
      return true
    } catch {
      return false
    }
  }

  if (routing.status !== 'RELEASED') return null

  const routingCompleted =
    operations.length > 0 && completedOperationIds.size === operations.length

  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-28px_rgba(15,23,42,0.28)]">
      <div className="flex flex-col gap-2.5 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-blue-600">
            Ejecución de retrabajo
          </p>
          <h3 className="mt-0.5 text-[10px] font-semibold text-slate-950">
            Rev {routing.revision} · {nonConformity.number}
          </h3>
          <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
            La primera operación cambia la OT a REWORK_IN_PROGRESS. Al completar
            toda la ruta, el backend crea una nueva inspección PENDING.
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-2 py-1 text-[7px] font-semibold text-blue-700 ring-1 ring-blue-100">
          {completedOperationIds.size}/{operations.length} completadas
        </span>
      </div>

      {!canExecute ? (
        <p className="mx-3.5 mt-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-[8px] text-slate-500">
          Solo PRODUCTION o ADMIN pueden ejecutar las operaciones de retrabajo.
        </p>
      ) : null}

      {machinesQuery.isError ? (
        <p className="mx-3.5 mt-3 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-[8px] leading-4 text-amber-800">
          No pudimos cargar máquinas. El retrabajo puede iniciarse sin máquina
          si la operación lo permite.
        </p>
      ) : null}

      <div className="space-y-2.5 px-3.5 py-3">
        {operations.map((operation, index) => {
          const operationExecutions = routingExecutions.filter(
            (execution) => execution.routingOperationId === operation.id,
          )
          const unlocked = operations
            .slice(0, index)
            .every((previous) => completedOperationIds.has(previous.id))

          return (
            <ReworkOperationCard
              key={operation.id}
              operation={operation}
              executions={operationExecutions}
              workOrderStatus={workOrderStatus}
              unlocked={unlocked}
              canExecute={canExecute}
              onStart={(selected) => {
                clearErrors()
                setStartOperation(selected)
              }}
              onComplete={(execution) => {
                clearErrors()
                setActiveExecution(execution)
                setDialog('complete')
              }}
              onCancel={(execution) => {
                clearErrors()
                setActiveExecution(execution)
                setDialog('cancel')
              }}
            />
          )
        })}
      </div>

      {routingCompleted && workOrderStatus === 'QUALITY_PENDING' ? (
        <p className="mx-3.5 mb-3 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-2.5 text-[8px] leading-4 text-blue-800">
          Retrabajo completado. Se creó una nueva reinspección PENDING ligada a{' '}
          {nonConformity.number}. Continúa en la sección de inspecciones.
        </p>
      ) : null}

      <StartOperationDialog
        open={startOperation !== null}
        operation={startOperation}
        operatorLabel={session?.user.email ?? 'Usuario actual'}
        machines={machinesQuery.data ?? []}
        submitting={mutations.startExecution.isPending}
        error={mutations.startExecution.error}
        onClose={() => {
          mutations.startExecution.reset()
          setStartOperation(null)
        }}
        onSubmit={start}
      />

      <CompleteExecutionDialog
        open={dialog === 'complete'}
        execution={activeExecution}
        plannedQuantity={nonConformity.affectedQuantity ?? 1}
        submitting={mutations.completeExecution.isPending}
        error={mutations.completeExecution.error}
        onClose={() => {
          mutations.completeExecution.reset()
          setDialog(null)
          setActiveExecution(null)
        }}
        onSubmit={complete}
      />

      <CancelExecutionDialog
        open={dialog === 'cancel'}
        execution={activeExecution}
        submitting={mutations.cancelExecution.isPending}
        error={mutations.cancelExecution.error}
        onClose={() => {
          mutations.cancelExecution.reset()
          setDialog(null)
          setActiveExecution(null)
        }}
        onSubmit={cancel}
      />
    </section>
  )
}
