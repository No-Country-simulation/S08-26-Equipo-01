import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addQualityCheck,
  completeQualityInspection,
  handoffWorkOrderToQuality,
  startQualityInspection,
  updateQualityCheck,
} from '../api/quality.api'
import type {
  SaveQualityCheckPayload,
  StartQualityInspectionPayload,
} from '../types/quality.types'
import { workOrderKeys } from './useWorkOrders'

export function useQualityMutations(workOrderId: number) {
  const queryClient = useQueryClient()

  const refreshWorkOrder = () =>
    queryClient.invalidateQueries({ queryKey: workOrderKeys.all })

  const handoff = useMutation({
    mutationFn: () => handoffWorkOrderToQuality(workOrderId),
    onSuccess: refreshWorkOrder,
  })

  const startInspection = useMutation({
    mutationFn: ({
      inspectionId,
      payload,
    }: {
      inspectionId: number
      payload?: StartQualityInspectionPayload
    }) => startQualityInspection(inspectionId, payload),
    onSuccess: refreshWorkOrder,
  })

  const addCheck = useMutation({
    mutationFn: ({
      inspectionId,
      payload,
    }: {
      inspectionId: number
      payload: SaveQualityCheckPayload
    }) => addQualityCheck(inspectionId, payload),
    onSuccess: refreshWorkOrder,
  })

  const updateCheck = useMutation({
    mutationFn: ({
      inspectionId,
      checkId,
      payload,
    }: {
      inspectionId: number
      checkId: number
      payload: SaveQualityCheckPayload
    }) => updateQualityCheck(inspectionId, checkId, payload),
    onSuccess: refreshWorkOrder,
  })

  const completeInspection = useMutation({
    mutationFn: (inspectionId: number) =>
      completeQualityInspection(inspectionId),
    onSuccess: refreshWorkOrder,
  })

  return {
    handoff,
    startInspection,
    addCheck,
    updateCheck,
    completeInspection,
  }
}
