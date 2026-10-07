import { useMutation, useQueryClient } from '@tanstack/react-query'
import { machineKeys } from '@/modules/machines'
import {
  materialKeys,
  recordMaterialConsumption,
  type RecordMaterialConsumptionPayload,
} from '@/modules/materials'
import {
  cancelOperationExecution,
  completeOperationExecution,
  startOperationExecution,
} from '../api/production.api'
import type {
  CancelOperationExecutionPayload,
  CompleteOperationExecutionPayload,
  StartOperationExecutionPayload,
} from '../types/workOrder.types'
import { workOrderKeys } from './useWorkOrders'

export function useProductionMutations(workOrderId: number) {
  const queryClient = useQueryClient()

  const refreshWorkOrder = () =>
    queryClient.invalidateQueries({ queryKey: workOrderKeys.all })

  const refreshMachines = () =>
    queryClient.invalidateQueries({ queryKey: machineKeys.all })

  const refreshMaterials = () =>
    queryClient.invalidateQueries({ queryKey: materialKeys.all })

  const startExecution = useMutation({
    mutationFn: ({
      operationId,
      payload,
    }: {
      operationId: number
      payload: StartOperationExecutionPayload
    }) => startOperationExecution(operationId, payload),
    onSuccess: async () => {
      await Promise.all([refreshWorkOrder(), refreshMachines()])
    },
  })

  const completeExecution = useMutation({
    mutationFn: ({
      executionId,
      payload,
    }: {
      executionId: number
      payload: CompleteOperationExecutionPayload
    }) => completeOperationExecution(executionId, payload),
    onSuccess: async () => {
      await Promise.all([refreshWorkOrder(), refreshMachines()])
    },
  })

  const cancelExecution = useMutation({
    mutationFn: ({
      executionId,
      payload,
    }: {
      executionId: number
      payload: CancelOperationExecutionPayload
    }) => cancelOperationExecution(executionId, payload),
    onSuccess: async () => {
      await Promise.all([refreshWorkOrder(), refreshMachines()])
    },
  })

  const recordConsumption = useMutation({
    mutationFn: (payload: RecordMaterialConsumptionPayload) =>
      recordMaterialConsumption(workOrderId, payload),
    onSuccess: async () => {
      await Promise.all([refreshWorkOrder(), refreshMaterials()])
    },
  })

  return {
    startExecution,
    completeExecution,
    cancelExecution,
    recordConsumption,
  }
}
