import { useMemo } from 'react'
import type {
  OperationExecutionDto,
  RoutingOperationDto,
} from '../types/workOrder.types'

interface RoutingFlowViewProps {
  operations: RoutingOperationDto[]
  executions?: OperationExecutionDto[]
  routingReleased?: boolean
  selectedOperationId?: number | null
  onSelect?: (operationId: number) => void
}

const NODE_WIDTH = 188
const NODE_HEIGHT = 78
const GAP_X = 76
const GAP_Y = 22
const PADDING = 22

interface NodePosition {
  x: number
  y: number
}

function prerequisiteIds(operation: RoutingOperationDto) {
  return operation.prerequisiteOperationIds ?? []
}

function nodePresentation(
  operation: RoutingOperationDto,
  executions: OperationExecutionDto[] | undefined,
  completedIds: Set<number>,
  routingReleased: boolean | undefined,
) {
  const dependencies = prerequisiteIds(operation)

  if (!executions) {
    return {
      label: dependencies.length === 0 ? 'Inicio libre' : 'Definida',
      card: 'border-slate-200 bg-white',
      badge: 'bg-slate-100 text-slate-600',
      dot: 'bg-slate-400',
    }
  }

  const attempts = executions.filter(
    (execution) => execution.routingOperationId === operation.id,
  )
  const completed = attempts.some((execution) => execution.status === 'COMPLETED')
  const inProgress = attempts.some(
    (execution) => execution.status === 'IN_PROGRESS',
  )
  const cancelled = attempts.some((execution) => execution.status === 'CANCELLED')
  const unlocked =
    routingReleased === true &&
    dependencies.every((id) => completedIds.has(id))

  if (completed) {
    return {
      label: 'Completada',
      card: 'border-emerald-200 bg-emerald-50/65',
      badge: 'bg-emerald-100 text-emerald-700',
      dot: 'bg-emerald-500',
    }
  }
  if (inProgress) {
    return {
      label: 'En ejecución',
      card: 'border-blue-300 bg-blue-50/70',
      badge: 'bg-blue-100 text-blue-700',
      dot: 'bg-blue-600',
    }
  }
  if (unlocked) {
    return {
      label: cancelled ? 'Lista para reintentar' : 'Lista',
      card: cancelled
        ? 'border-amber-200 bg-amber-50/60'
        : 'border-blue-200 bg-white',
      badge: cancelled
        ? 'bg-amber-100 text-amber-700'
        : 'bg-blue-50 text-blue-700',
      dot: cancelled ? 'bg-amber-500' : 'bg-blue-400',
    }
  }

  return {
    label: 'Esperando',
    card: 'border-slate-200 bg-slate-50/80',
    badge: 'bg-slate-200/70 text-slate-500',
    dot: 'bg-slate-300',
  }
}

export function RoutingFlowView({
  operations,
  executions,
  routingReleased,
  selectedOperationId,
  onSelect,
}: RoutingFlowViewProps) {
  const sortedOperations = useMemo(
    () =>
      [...operations].sort(
        (left, right) => left.sequenceNumber - right.sequenceNumber,
      ),
    [operations],
  )

  const layout = useMemo(() => {
    const byId = new Map(sortedOperations.map((operation) => [operation.id, operation]))
    const levels = new Map<number, number>()

    for (const operation of sortedOperations) {
      const prerequisiteLevels = prerequisiteIds(operation)
        .map((id) => levels.get(id))
        .filter((level): level is number => level !== undefined)
      levels.set(
        operation.id,
        prerequisiteLevels.length === 0
          ? 0
          : Math.max(...prerequisiteLevels) + 1,
      )
    }

    const groups = new Map<number, RoutingOperationDto[]>()
    for (const operation of sortedOperations) {
      const level = levels.get(operation.id) ?? 0
      const group = groups.get(level) ?? []
      group.push(operation)
      groups.set(level, group)
    }

    const maxLevel = Math.max(0, ...groups.keys())
    const maxRows = Math.max(1, ...[...groups.values()].map((group) => group.length))
    const width = Math.max(
      620,
      PADDING * 2 + (maxLevel + 1) * NODE_WIDTH + maxLevel * GAP_X,
    )
    const height = Math.max(
      130,
      PADDING * 2 + maxRows * NODE_HEIGHT + (maxRows - 1) * GAP_Y,
    )
    const positions = new Map<number, NodePosition>()

    for (const [level, group] of groups.entries()) {
      const groupHeight =
        group.length * NODE_HEIGHT + Math.max(0, group.length - 1) * GAP_Y
      const startY = Math.max(PADDING, (height - groupHeight) / 2)

      group.forEach((operation, index) => {
        positions.set(operation.id, {
          x: PADDING + level * (NODE_WIDTH + GAP_X),
          y: startY + index * (NODE_HEIGHT + GAP_Y),
        })
      })
    }

    return { byId, positions, width, height }
  }, [sortedOperations])

  const completedIds = useMemo(
    () =>
      new Set(
        (executions ?? [])
          .filter((execution) => execution.status === 'COMPLETED')
          .map((execution) => execution.routingOperationId),
      ),
    [executions],
  )

  if (sortedOperations.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/45">
      <div
        className="relative"
        style={{ width: layout.width, height: layout.height }}
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${layout.width} ${layout.height}`}
        >
          <defs>
            <marker
              id="routing-flow-arrow"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
            </marker>
          </defs>
          {sortedOperations.flatMap((operation) => {
            const target = layout.positions.get(operation.id)
            if (!target) return []

            return prerequisiteIds(operation).map((prerequisiteId) => {
              const source = layout.positions.get(prerequisiteId)
              if (!source) return null

              const x1 = source.x + NODE_WIDTH
              const y1 = source.y + NODE_HEIGHT / 2
              const x2 = target.x
              const y2 = target.y + NODE_HEIGHT / 2
              const control = Math.max(28, (x2 - x1) * 0.45)

              return (
                <path
                  key={`${prerequisiteId}-${operation.id}`}
                  d={`M ${x1} ${y1} C ${x1 + control} ${y1}, ${x2 - control} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  markerEnd="url(#routing-flow-arrow)"
                />
              )
            })
          })}
        </svg>

        {sortedOperations.map((operation) => {
          const position = layout.positions.get(operation.id)
          if (!position) return null

          const presentation = nodePresentation(
            operation,
            executions,
            completedIds,
            routingReleased,
          )
          const selected = selectedOperationId === operation.id
          const prerequisites = prerequisiteIds(operation)
            .map((id) => layout.byId.get(id))
            .filter((item): item is RoutingOperationDto => Boolean(item))
          const pendingPrerequisites = prerequisites.filter(
            (item) => !completedIds.has(item.id),
          )
          const dependencyText =
            prerequisites.length === 0
              ? 'Sin dependencia previa'
              : executions && pendingPrerequisites.length > 0
                ? `Espera: ${pendingPrerequisites.map((item) => item.code).join(' + ')}`
                : `Depende de: ${prerequisites.map((item) => item.code).join(' + ')}`

          return (
            <button
              id={`routing-flow-operation-${operation.id}`}
              key={operation.id}
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(operation.id)}
              className={`absolute overflow-hidden rounded-xl border px-3 py-2.5 text-left shadow-sm transition ${presentation.card} ${
                selected
                  ? 'ring-2 ring-blue-300 ring-offset-2'
                  : onSelect
                    ? 'hover:-translate-y-0.5 hover:shadow-md'
                    : ''
              } disabled:cursor-default`}
              style={{
                left: position.x,
                top: position.y,
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[7.5px] font-bold uppercase tracking-[0.08em] text-blue-600">
                    {operation.sequenceNumber} · {operation.code}
                  </p>
                  <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-900">
                    {operation.name}
                  </p>
                </div>
                <span
                  className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${presentation.dot}`}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[6.5px] font-semibold ${presentation.badge}`}
                >
                  {presentation.label}
                </span>
                <span className="text-[6.5px] text-slate-400">
                  {operation.estimatedMinutes} min
                </span>
              </div>
              <p className="mt-1 truncate text-[6.5px] text-slate-400">
                {dependencyText}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
