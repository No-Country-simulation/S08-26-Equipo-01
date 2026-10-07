import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  attachDeliveryEvidence,
  cancelDelivery,
  completeDelivery,
  createDelivery,
  dispatchDelivery,
  uploadDeliveryEvidence,
} from '../api/deliveries.api'
import type {
  AttachDeliveryEvidencePayload,
  CancelDeliveryPayload,
  CompleteDeliveryPayload,
  CreateDeliveryPayload,
  DispatchDeliveryPayload,
} from '../types/delivery.types'
import { deliveryKeys } from './useDeliveries'
import { workOrderKeys } from './useWorkOrders'

export function useDeliveryMutations() {
  const queryClient = useQueryClient()

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workOrderKeys.all }),
      queryClient.invalidateQueries({ queryKey: deliveryKeys.all }),
      queryClient.invalidateQueries({ queryKey: ['job-cases'] }),
      queryClient.invalidateQueries({ queryKey: ['document-center'] }),
      queryClient.invalidateQueries({ queryKey: ['internal-dashboard'] }),
    ])
  }

  const create = useMutation({
    mutationFn: ({
      workOrderId,
      payload,
    }: {
      workOrderId: number
      payload: CreateDeliveryPayload
    }) => createDelivery(workOrderId, payload),
    onSuccess: refresh,
  })

  const dispatch = useMutation({
    mutationFn: ({
      deliveryId,
      payload,
    }: {
      deliveryId: number
      payload: DispatchDeliveryPayload
    }) => dispatchDelivery(deliveryId, payload),
    onSuccess: refresh,
  })

  const complete = useMutation({
    mutationFn: ({
      deliveryId,
      payload,
    }: {
      deliveryId: number
      payload: CompleteDeliveryPayload
    }) => completeDelivery(deliveryId, payload),
    onSuccess: refresh,
  })

  const uploadEvidence = useMutation({
    mutationFn: ({
      deliveryId,
      file,
    }: {
      deliveryId: number
      file: File
    }) => uploadDeliveryEvidence(deliveryId, file),
    onSuccess: refresh,
  })

  const attachEvidence = useMutation({
    mutationFn: ({
      deliveryId,
      payload,
    }: {
      deliveryId: number
      payload: AttachDeliveryEvidencePayload
    }) => attachDeliveryEvidence(deliveryId, payload),
    onSuccess: refresh,
  })

  const cancel = useMutation({
    mutationFn: ({
      deliveryId,
      payload,
    }: {
      deliveryId: number
      payload: CancelDeliveryPayload
    }) => cancelDelivery(deliveryId, payload),
    onSuccess: refresh,
  })

  return {
    create,
    dispatch,
    complete,
    uploadEvidence,
    attachEvidence,
    cancel,
  }
}
