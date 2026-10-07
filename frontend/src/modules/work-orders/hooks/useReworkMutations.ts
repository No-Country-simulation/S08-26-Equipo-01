import { useMutation, useQueryClient } from '@tanstack/react-query'
import { machineKeys } from '@/modules/machines'
import {
  cancelOperationExecution,
  completeOperationExecution,
  startOperationExecution,
} from '../api/production.api'
import {
  addRoutingOperation,
  approveRoutingSheet,
  releaseRoutingSheet,
  removeRoutingOperation,
  reopenRoutingSheet,
  updateRoutingOperation,
} from '../api/workOrders.api'
import type {
  CancelOperationExecutionPayload,
  CompleteOperationExecutionPayload,
  ReopenRoutingSheetPayload,
  RoutingOperationPayload,
  StartOperationExecutionPayload,
} from '../types/workOrder.types'
import { workOrderKeys } from './useWorkOrders'

export function useReworkMutations() {
  const queryClient = useQueryClient()

  const refreshWorkOrder = () =>
    queryClient.invalidateQueries({ queryKey: workOrderKeys.all })

  const refreshExecution = async () => {
    await Promise.all([
      refreshWorkOrder(),
      queryClient.invalidateQueries({ queryKey: machineKeys.all }),
    ])
  }

  const addOperation = useMutation({
    mutationFn: ({
      routingSheetId,
      payload,
    }: {
      routingSheetId: number
      payload: RoutingOperationPayload
    }) => addRoutingOperation(routingSheetId, payload),
    onSuccess: refreshWorkOrder,
  })

  const updateOperation = useMutation({
    mutationFn: ({
      routingSheetId,
      operationId,
      payload,
    }: {
      routingSheetId: number
      operationId: number
      payload: RoutingOperationPayload
    }) => updateRoutingOperation(routingSheetId, operationId, payload),
    onSuccess: refreshWorkOrder,
  })

  const removeOperation = useMutation({
    mutationFn: ({
      routingSheetId,
      operationId,
    }: {
      routingSheetId: number
      operationId: number
    }) => removeRoutingOperation(routingSheetId, operationId),
    onSuccess: refreshWorkOrder,
  })

  const approveAndRelease = useMutation({
    mutationFn: async (routingSheetId: number) => {
      await approveRoutingSheet(routingSheetId)
      return releaseRoutingSheet(routingSheetId)
    },
    onSettled: refreshWorkOrder,
  })

  const release = useMutation({
    mutationFn: (routingSheetId: number) => releaseRoutingSheet(routingSheetId),
    onSuccess: refreshWorkOrder,
  })

  const reopen = useMutation({
    mutationFn: ({
      routingSheetId,
      payload,
    }: {
      routingSheetId: number
      payload: ReopenRoutingSheetPayload
    }) => reopenRoutingSheet(routingSheetId, payload),
    onSuccess: refreshWorkOrder,
  })

  const startExecution = useMutation({
    mutationFn: ({
      operationId,
      payload,
    }: {
      operationId: number
      payload: StartOperationExecutionPayload
    }) => startOperationExecution(operationId, payload),
    onSuccess: refreshExecution,
  })

  const completeExecution = useMutation({
    mutationFn: ({
      executionId,
      payload,
    }: {
      executionId: number
      payload: CompleteOperationExecutionPayload
    }) => completeOperationExecution(executionId, payload),
    onSuccess: refreshExecution,
  })

  const cancelExecution = useMutation({
    mutationFn: ({
      executionId,
      payload,
    }: {
      executionId: number
      payload: CancelOperationExecutionPayload
    }) => cancelOperationExecution(executionId, payload),
    onSuccess: refreshExecution,
  })

  return {
    addOperation,
    updateOperation,
    removeOperation,
    approveAndRelease,
    release,
    reopen,
    startExecution,
    completeExecution,
    cancelExecution,
  }
}
