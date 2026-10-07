import { useQuery } from '@tanstack/react-query'
import { getQuotation } from '../api/quotations.api'
import { quotationKeys } from './useQuotations'

export function useQuotationDetail(quotationId: number | null) {
  return useQuery({
    queryKey: quotationKeys.detail(quotationId),
    queryFn: () => getQuotation(quotationId as number),
    enabled: quotationId !== null,
  })
}
