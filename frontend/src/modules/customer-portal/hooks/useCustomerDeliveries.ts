import { useQuery } from '@tanstack/react-query'
import { getCustomerRequestDeliveries } from '../api/customerDeliveries.api'

export const customerDeliveryKeys = {
  all: ['customer-deliveries'] as const,
  request: (customerId: number, requestId: number) =>
    [...customerDeliveryKeys.all, customerId, requestId] as const,
}

export function useCustomerRequestDeliveries(
  customerId: number,
  requestId: number | null,
) {
  return useQuery({
    queryKey: customerDeliveryKeys.request(customerId, requestId ?? 0),
    queryFn: () => getCustomerRequestDeliveries(customerId, requestId ?? 0),
    enabled: requestId !== null,
  })
}
