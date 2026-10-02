import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { useMachines } from '@/modules/machines'
import type { RecordMaterialConsumptionPayload } from '@/modules/materials'
import { Button } from '@/shared/components/ui/Button'
import { CancelExecutionDialog } from './CancelExecutionDialog'
import { CompleteExecutionDialog } from './CompleteExecutionDialog'
import { ProductionBlocker } from './ProductionBlocker'
import { ProductionCurrentOperationPanel } from './ProductionCurrentOperationPanel'
import { ProductionMaterialsCard } from './ProductionMaterialsCard'
import { RecordMaterialConsumptionDialog } from './RecordMaterialConsumptionDialog'
import { ProductionRouteList } from './ProductionRouteList'
import { QualityHandoffPanel } from './QualityHandoffPanel'
import { StartOperationDialog } from './StartOperationDialog'
import { useProductionMutations } from '../hooks/useProductionMutations'
import { formatProductionDateTime } from '../model/productionPresenter'
import type {
  CancelOperationExecutionFormValues,
  CompleteOperationExecutionFormValues,
  StartOperationExecutionFormValues,
} from '../schemas/production.schemas'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
} from '../types/workOrder.types'
import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface WorkOrderProductionProps {
  data: WorkOrder360Dto
}

export function WorkOrderProduction({ data }: WorkOrderProductionProps) {
  const session = useSessionStore((state) => state.session)
  const location = useLocation()
  const roles = session?.user.roles ?? []
  const canExecute = roles.includes('ADMIN') || roles.includes('PRODUCTION')
  const productionRouting = data.routingSheets.find(
    (routing) => routing.purpose === 'PRODUCTION',
  )
  const routingReleased = productionRouting?.status === 'RELEASED'
  const machinesQuery = useMachines(canExecute && Boolean(routingReleased))
  const mutations = useProductionMutations(data.workOrder.id)
  const materialsHistoryRef = useRef<HTMLDivElement | null>(null)
  const [startOperation, setStartOperation] =
    useState<RoutingOperationDto | null>(null)
  const [activeExecution, setActiveExecution] =
    useState<OperationExecutionDto | null>(null)
  const [executionDialog, setExecutionDialog] = useState<
    'complete' | 'cancel' | null
  >(null)
  const [selectedOperationId, setSelectedOperationId] = useState<number | null>(
    null,
  )
  const [expandedOperationId, setExpandedOperationId] = useState<number | null>(
    null,
  )
  const [materialsOpen, setMaterialsOpen] = useState(() =>
    location.hash.startsWith('#material-lot-'),
  )
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false)

  const productionExecutions = useMemo(
    () =>
      data.production.executions.filter(
        (execution) =>
          productionRouting &&
          execution.routingSheetId === productionRouting.id &&
          execution.routingPurpose === 'PRODUCTION',
      ),
    [data.production.executions, productionRouting],
  )

  const operations = useMemo(
    () =>
      [...(productionRouting?.operations ?? [])].sort(
        (left, right) => left.sequenceNumber - right.sequenceNumber,
      ),
    [productionRouting],
  )

  const completedOperationIds = useMemo(
    () =>
      new Set(
        productionExecutions
          .filter((execution) => execution.status === 'COMPLETED')
          .map((execution) => execution.routingOperationId),
      ),
    [productionExecutions],
  )

  const inProgressExecution = productionExecutions.find(
    (execution) => execution.status === 'IN_PROGRESS',
  )
  const inProgressOperation = inProgressExecution
    ? operations.find(
        (operation) => operation.id === inProgressExecution.routingOperationId,
      )
    : undefined

  const nextOperation = operations.find((operation, index) => {
    if (completedOperationIds.has(operation.id)) return false

    return operations
      .slice(0, index)
      .every((previous) => completedOperationIds.has(previous.id))
  })

  const currentOperation =
    inProgressOperation ?? nextOperation ?? (data.production.productionCompleted
      ? null
      : operations.at(0) ?? null)

  const selectedOperation =
    operations.find((operation) => operation.id === selectedOperationId) ??
    currentOperation ??
    operations.at(-1) ??
    null

  const selectedExecutions = selectedOperation
    ? productionExecutions.filter(
        (execution) =>
          execution.routingOperationId === selectedOperation.id,
      )
    : []

  const selectedIndex = selectedOperation
    ? operations.findIndex((operation) => operation.id === selectedOperation.id)
    : -1
  const selectedUnlocked =
    selectedIndex >= 0 &&
    routingReleased === true &&
    operations
      .slice(0, selectedIndex)
      .every((previous) => completedOperationIds.has(previous.id))

  const completedOperations = completedOperationIds.size
  const totalOperations = operations.length
  const progress =
    totalOperations > 0
      ? Math.round((completedOperations / totalOperations) * 100)
      : 0
  const materialRecordingOpen =
    data.workOrder.status === 'IN_PRODUCTION'
  const latestConsumption = data.materials.at(-1)

  useEffect(() => {
    const executionMatch = location.hash.match(/^#operation-execution-(\d+)$/)

    if (executionMatch) {
      const executionId = Number(executionMatch[1])
      const execution = productionExecutions.find(
        (item) => item.id === executionId,
      )

      if (execution) {
        setSelectedOperationId(execution.routingOperationId)
        setExpandedOperationId(execution.routingOperationId)
      }
      return
    }

    const operationMatch = location.hash.match(/^#routing-operation-(\d+)$/)

    if (operationMatch) {
      setSelectedOperationId(Number(operationMatch[1]))
      return
    }

    if (location.hash.startsWith('#material-lot-')) {
      setMaterialsOpen(true)
    }
  }, [location.hash, productionExecutions])

  useEffect(() => {
    if (!location.hash) return

    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById(
        decodeURIComponent(location.hash.slice(1)),
      )
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [expandedOperationId, location.hash, materialsOpen])

  useEffect(() => {
    if (!materialsOpen || location.hash.startsWith('#material-lot-')) return

    const frame = window.requestAnimationFrame(() => {
      materialsHistoryRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [location.hash, materialsOpen])

  const clearExecutionErrors = () => {
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
      setSelectedOperationId(startOperation.id)
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
      setExecutionDialog(null)
      setActiveExecution(null)
      setSelectedOperationId(null)
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
      setExecutionDialog(null)
      setActiveExecution(null)
      setSelectedOperationId(null)
      return true
    } catch {
      return false
    }
  }

  const recordMaterial = async (payload: RecordMaterialConsumptionPayload) => {
    try {
      await mutations.recordConsumption.mutateAsync(payload)
      return true
    } catch {
      return false
    }
  }

  const openComplete = (execution: OperationExecutionDto) => {
    clearExecutionErrors()
    setActiveExecution(execution)
    setExecutionDialog('complete')
  }

  const openCancel = (execution: OperationExecutionDto) => {
    clearExecutionErrors()
    setActiveExecution(execution)
    setExecutionDialog('cancel')
  }

  return (
    <div className="space-y-3">
      {!productionRouting ? (
        <ProductionBlocker text="La orden todavía no tiene una hoja de ruta de producción." />
      ) : !routingReleased ? (
        <ProductionBlocker text="La hoja de ruta debe aprobarse y liberarse desde Preparación antes de ejecutar operaciones." />
      ) : null}

      {!canExecute ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[8px] leading-4 text-slate-500">
          La ejecución es de solo lectura para tu rol. Solo PRODUCTION o ADMIN
          pueden iniciar, finalizar o cancelar intentos y registrar consumos.
        </p>
      ) : null}

      {machinesQuery.isError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2.5 text-[8px] leading-4 text-amber-800">
          No pudimos cargar el catálogo de máquinas. Las operaciones todavía
          pueden iniciarse sin máquina asignada.
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.7fr)] lg:items-stretch">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
          <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  Ejecución de producción
                </p>
                <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
                  Ruta activa de fabricación
                </h2>
                <p className="mt-1 text-[8px] leading-4 text-slate-500">
                  Ejecuta las operaciones en secuencia y registra el resultado real de cada paso.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-1 text-right">
                <div>
                  <p className="text-[7px] text-slate-400">Inicio real</p>
                  <p className="mt-0.5 text-[8px] font-semibold text-slate-800">
                    {formatProductionDateTime(data.production.actualStartAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[7px] text-slate-400">Fin real</p>
                  <p className="mt-0.5 text-[8px] font-semibold text-slate-800">
                    {formatProductionDateTime(data.production.actualEndAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between gap-3 text-[8px] text-slate-500">
                <span>Progreso de operaciones</span>
                <span className="font-semibold text-slate-800">
                  {completedOperations}/{totalOperations} · {progress}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {operations.length > 0 ? (
            <ProductionRouteList
              operations={operations}
              executions={productionExecutions}
              routingReleased={routingReleased === true}
              selectedOperationId={selectedOperation?.id ?? null}
              expandedOperationId={expandedOperationId}
              onSelect={setSelectedOperationId}
              onToggleAttempts={(operationId) =>
                setExpandedOperationId((current) =>
                  current === operationId ? null : operationId,
                )
              }
            />
          ) : productionRouting ? (
            <div className="p-4">
              <ProductionBlocker text="La hoja de ruta no contiene operaciones ejecutables." />
            </div>
          ) : null}
        </section>

        <aside className="flex h-full flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
          {data.production.productionCompleted ? (
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                Producción completada
              </p>
              <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
                {completedOperations} de {totalOperations} operaciones terminadas
              </h2>
              <p className="mt-1 text-[8px] leading-4 text-slate-500">
                La ejecución de fabricación quedó cerrada. El siguiente paso formal es Calidad.
              </p>

              <div className="mt-4">
                <QualityHandoffPanel
                  workOrderId={data.workOrder.id}
                  workOrderStatus={data.workOrder.status}
                  productionCompleted={data.production.productionCompleted}
                  canHandoff={canExecute}
                  materialConsumptionCount={data.materials.length}
                  embedded
                />
              </div>
            </div>
          ) : (
            <ProductionCurrentOperationPanel
              operation={selectedOperation}
              executions={selectedExecutions}
              unlocked={selectedUnlocked}
              isCurrentOperation={
                selectedOperation !== null &&
                selectedOperation.id === currentOperation?.id
              }
              canExecute={canExecute}
              productionCompleted={data.production.productionCompleted}
              workOrderStatus={data.workOrder.status}
              onStart={(operation) => {
                clearExecutionErrors()
                setStartOperation(operation)
              }}
              onComplete={openComplete}
              onCancel={openCancel}
            />
          )}

          <div className="mt-auto border-t border-slate-100 pt-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Material utilizado
                </p>
                <p className="mt-1 text-[9px] font-semibold text-slate-900">
                  {data.materials.length === 0
                    ? 'Sin consumo registrado'
                    : `${data.materials.length} consumo${data.materials.length === 1 ? '' : 's'} registrado${data.materials.length === 1 ? '' : 's'}`}
                </p>
                {latestConsumption ? (
                  <p className="mt-1 text-[7px] leading-3.5 text-slate-400">
                    Lote {latestConsumption.consumption.lotNumber} ·{' '}
                    {latestConsumption.consumption.quantityUsed}{' '}
                    {latestConsumption.consumption.unit}
                  </p>
                ) : (
                  <p className="mt-1 text-[7px] leading-3.5 text-slate-400">
                    Registra el lote real consumido durante la fabricación.
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                {canExecute && materialRecordingOpen ? (
                  <Button
                    size="sm"
                    className="!h-7 !px-2.5 !text-[7.5px]"
                    onClick={() => {
                      mutations.recordConsumption.reset()
                      setMaterialDialogOpen(true)
                    }}
                  >
                    Registrar consumo
                  </Button>
                ) : null}

                {data.materials.length > 0 ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="!h-7 !px-2.5 !text-[7.5px]"
                    onClick={() => setMaterialsOpen((current) => !current)}
                  >
                    {materialsOpen ? 'Ocultar consumos' : 'Ver consumos'}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {materialsOpen ? (
        <div ref={materialsHistoryRef} className="scroll-mt-20">
          <ProductionMaterialsCard consumptions={data.materials} />
        </div>
      ) : null}

      <RecordMaterialConsumptionDialog
        open={materialDialogOpen}
        submitting={mutations.recordConsumption.isPending}
        error={mutations.recordConsumption.error}
        onClose={() => {
          mutations.recordConsumption.reset()
          setMaterialDialogOpen(false)
        }}
        onSubmit={recordMaterial}
      />

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
        open={executionDialog === 'complete'}
        execution={activeExecution}
        plannedQuantity={data.production.plannedQuantity}
        submitting={mutations.completeExecution.isPending}
        error={mutations.completeExecution.error}
        onClose={() => {
          mutations.completeExecution.reset()
          setExecutionDialog(null)
          setActiveExecution(null)
        }}
        onSubmit={complete}
      />

      <CancelExecutionDialog
        open={executionDialog === 'cancel'}
        execution={activeExecution}
        submitting={mutations.cancelExecution.isPending}
        error={mutations.cancelExecution.error}
        onClose={() => {
          mutations.cancelExecution.reset()
          setExecutionDialog(null)
          setActiveExecution(null)
        }}
        onSubmit={cancel}
      />
    </div>
  )
}
