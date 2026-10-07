import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addRoutingOperation,
  approveRoutingSheet,
  createProductionRouting,
  pinWorkOrderDocument,
  releaseRoutingSheet,
  removeRoutingOperation,
  reopenRoutingSheet,
  updateRoutingOperation,
  updateWorkOrderPlanning,
} from '../api/workOrders.api'
import type {
  ReopenRoutingSheetPayload,
  RoutingOperationPayload,
  UpdateWorkOrderPlanningPayload,
} from '../types/workOrder.types'
import { workOrderKeys } from './useWorkOrders'

export function useWorkOrderPreparationMutations(workOrderId: number) {
  const queryClient = useQueryClient()
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: workOrderKeys.all })

  const planning = useMutation({
    mutationFn: (payload: UpdateWorkOrderPlanningPayload) =>
      updateWorkOrderPlanning(workOrderId, payload),
    onSuccess: refresh,
  })

  const pinDocument = useMutation({
    mutationFn: ({
      documentId,
      versionId,
    }: {
      documentId: number
      versionId: number
    }) => pinWorkOrderDocument(workOrderId, documentId, versionId),
    onSuccess: refresh,
  })

  const createRouting = useMutation({
    mutationFn: () => createProductionRouting(workOrderId),
    onSuccess: refresh,
  })

  const addOperation = useMutation({
    mutationFn: ({
      routingSheetId,
      payload,
    }: {
      routingSheetId: number
      payload: RoutingOperationPayload
    }) => addRoutingOperation(routingSheetId, payload),
    onSuccess: refresh,
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
    onSuccess: refresh,
  })

  const removeOperation = useMutation({
    mutationFn: ({
      routingSheetId,
      operationId,
    }: {
      routingSheetId: number
      operationId: number
    }) => removeRoutingOperation(routingSheetId, operationId),
    onSuccess: refresh,
  })

  const approveRouting = useMutation({
    mutationFn: (routingSheetId: number) => approveRoutingSheet(routingSheetId),
    onSuccess: refresh,
  })

  const reopenRouting = useMutation({
    mutationFn: ({
      routingSheetId,
      payload,
    }: {
      routingSheetId: number
      payload: ReopenRoutingSheetPayload
    }) => reopenRoutingSheet(routingSheetId, payload),
    onSuccess: refresh,
  })

  const releaseRouting = useMutation({
    mutationFn: (routingSheetId: number) => releaseRoutingSheet(routingSheetId),
    onSuccess: refresh,
  })

  return {
    planning,
    pinDocument,
    createRouting,
    addOperation,
    updateOperation,
    removeOperation,
    approveRouting,
    reopenRouting,
    releaseRouting,
  }
}
