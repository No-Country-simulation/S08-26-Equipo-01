import { useQuery } from '@tanstack/react-query'
import { getWorkOrder360 } from '../api/workOrders.api'
import { workOrderKeys } from './useWorkOrders'

export function useWorkOrder360(workOrderId: number | null) {
  return useQuery({
    queryKey: [...workOrderKeys.all, '360', workOrderId] as const,
    queryFn: () => getWorkOrder360(workOrderId as number),
    enabled: workOrderId !== null,
  })
}
