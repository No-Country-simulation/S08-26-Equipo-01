import type {
  NonConformityDisposition,
  NonConformityDto,
} from '../types/quality.types'
import type {
  OperationExecutionDto,
  RoutingSheetDto,
} from '../types/workOrder.types'

const dispositionLabels: Record<NonConformityDisposition, string> = {
  REWORK: 'Retrabajo',
  SCRAP: 'Descarte',
  USE_AS_IS: 'Aceptación bajo concesión',
}

export function hasCompleteNonConformityDetails(
  nonConformity: NonConformityDto,
): boolean {
  return (
    nonConformity.affectedQuantity !== null &&
    nonConformity.affectedQuantity > 0 &&
    Boolean(nonConformity.severity?.trim()) &&
    Boolean(nonConformity.description?.trim())
  )
}

export function getDispositionLabel(
  disposition: NonConformityDisposition | null,
): string {
  return disposition ? dispositionLabels[disposition] : 'Sin definir'
}

export function formatNonConformityDateTime(value: string | null): string {
  if (!value) return 'Sin registrar'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function isReworkRoutingCompleted(
  routing: RoutingSheetDto,
  executions: OperationExecutionDto[],
): boolean {
  if (routing.operations.length === 0) return false

  return routing.operations.every((operation) =>
    executions.some(
      (execution) =>
        execution.routingOperationId === operation.id &&
        execution.status === 'COMPLETED',
    ),
  )
}
