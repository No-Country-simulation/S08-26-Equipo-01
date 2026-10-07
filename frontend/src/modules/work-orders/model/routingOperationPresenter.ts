import type { RoutingOperationDto } from '../types/workOrder.types'

export function suggestOperationCode(sequenceNumber: number) {
  if (!Number.isInteger(sequenceNumber) || sequenceNumber <= 0) return ''
  return `OP-${sequenceNumber * 10}`
}

export function previousOperations(
  operations: RoutingOperationDto[],
  sequenceNumber: number,
  operationId?: number,
) {
  return operations
    .filter((item) => item.id !== operationId)
    .filter((item) => item.sequenceNumber < sequenceNumber)
    .sort((left, right) => left.sequenceNumber - right.sequenceNumber)
}

export function defaultPrerequisites(
  operations: RoutingOperationDto[],
  sequenceNumber: number,
  operationId?: number,
) {
  const previous = previousOperations(operations, sequenceNumber, operationId)
  const immediate = previous.at(-1)
  return immediate ? [immediate.id] : []
}

export function impactedByResequence(
  operations: RoutingOperationDto[],
  targetSequence: number,
  current?: RoutingOperationDto,
) {
  if (!Number.isInteger(targetSequence) || targetSequence <= 0) return []

  if (!current) {
    return operations
      .filter((item) => item.sequenceNumber >= targetSequence)
      .sort((left, right) => left.sequenceNumber - right.sequenceNumber)
      .map((item) => ({
        operation: item,
        nextSequence: item.sequenceNumber + 1,
      }))
  }

  if (targetSequence < current.sequenceNumber) {
    return operations
      .filter((item) => item.id !== current.id)
      .filter((item) => item.sequenceNumber >= targetSequence)
      .filter((item) => item.sequenceNumber < current.sequenceNumber)
      .sort((left, right) => left.sequenceNumber - right.sequenceNumber)
      .map((item) => ({
        operation: item,
        nextSequence: item.sequenceNumber + 1,
      }))
  }

  return operations
    .filter((item) => item.id !== current.id)
    .filter((item) => item.sequenceNumber > current.sequenceNumber)
    .filter((item) => item.sequenceNumber <= targetSequence)
    .sort((left, right) => left.sequenceNumber - right.sequenceNumber)
    .map((item) => ({
      operation: item,
      nextSequence: item.sequenceNumber - 1,
    }))
}
