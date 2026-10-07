import type { BadgeProps } from '@/shared/components/ui/Badge'
import type {
  OperationExecutionDto,
  OperationExecutionStatus,
  RoutingOperationDto,
} from '../types/workOrder.types'

const executionPresentation: Record<
  OperationExecutionStatus,
  { label: string; tone: BadgeProps['tone'] }
> = {
  IN_PROGRESS: { label: 'En ejecución', tone: 'warning' },
  COMPLETED: { label: 'Completada', tone: 'success' },
  CANCELLED: { label: 'Cancelada', tone: 'danger' },
}

export function getExecutionPresentation(status: OperationExecutionStatus) {
  return executionPresentation[status]
}

export function formatProductionDateTime(value: string | null): string {
  if (!value) return 'Pendiente'

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function executionDurationMinutes(
  execution: OperationExecutionDto,
): number | null {
  if (!execution.finishedAt) return null

  const started = new Date(execution.startedAt).getTime()
  const finished = new Date(execution.finishedAt).getTime()

  if (!Number.isFinite(started) || !Number.isFinite(finished)) return null

  return Math.max(0, Math.round((finished - started) / 60_000))
}

export function getProductionDependencyIds(
  operation: RoutingOperationDto,
): number[] {
  return operation.prerequisiteOperationIds ?? []
}
