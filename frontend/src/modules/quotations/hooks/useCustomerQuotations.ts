import { useQuery } from '@tanstack/react-query'
import { getCustomerQuotations } from '../api/customerQuotations.api'

export const customerQuotationKeys = {
  all: ['customer-quotations'] as const,
  list: (customerId: number) =>
    [...customerQuotationKeys.all, 'list', customerId] as const,
  detail: (customerId: number, quotationId: number | null) =>
    [...customerQuotationKeys.all, 'detail', customerId, quotationId] as const,
  revisions: (customerId: number, quotationId: number | null) =>
    [
      ...customerQuotationKeys.all,
      'revisions',
      customerId,
      quotationId,
    ] as const,
}

export function useCustomerQuotations(
  customerId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: customerQuotationKeys.list(customerId),
    queryFn: () => getCustomerQuotations(customerId),
    enabled,
  })
}
