import { useQuery } from '@tanstack/react-query'
import {
  getPendingWorkOrders,
  getWorkOrders,
} from '../api/workOrders.api'

export const workOrderKeys = {
  all: ['work-orders'] as const,
  list: () => [...workOrderKeys.all, 'list'] as const,
  pendingCreation: () => [...workOrderKeys.all, 'pending-creation'] as const,
}

export function useWorkOrders(enabled = true) {
  return useQuery({
    queryKey: workOrderKeys.list(),
    queryFn: getWorkOrders,
    enabled,
  })
}


export function usePendingWorkOrders(enabled = true) {
  return useQuery({
    queryKey: workOrderKeys.pendingCreation(),
    queryFn: getPendingWorkOrders,
    enabled,
  })
}
