import { useQuery } from '@tanstack/react-query'
import { getDeliveries } from '../api/deliveries.api'

export const deliveryKeys = {
  all: ['deliveries'] as const,
  list: () => [...deliveryKeys.all, 'list'] as const,
}

export function useDeliveries() {
  return useQuery({
    queryKey: deliveryKeys.list(),
    queryFn: getDeliveries,
  })
}
