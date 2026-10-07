import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelWorkOrder } from '../api/workOrders.api'
import type { CancelWorkOrderPayload } from '../types/workOrder.types'
import { workOrderKeys } from './useWorkOrders'

export function useCancelWorkOrder(workOrderId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CancelWorkOrderPayload) =>
      cancelWorkOrder(workOrderId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workOrderKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['job-cases'] }),
      ])
    },
  })
}
