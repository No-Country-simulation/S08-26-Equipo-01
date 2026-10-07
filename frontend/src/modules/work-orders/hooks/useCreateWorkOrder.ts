import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createWorkOrder } from '../api/workOrders.api'
import type { CreateWorkOrderPayload } from '../types/workOrder.types'
import { workOrderKeys } from './useWorkOrders'

export function useCreateWorkOrder(caseId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateWorkOrderPayload) =>
      createWorkOrder(caseId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: workOrderKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['job-cases'] }),
        queryClient.invalidateQueries({ queryKey: ['internal-dashboard'] }),
      ])
    },
  })
}
