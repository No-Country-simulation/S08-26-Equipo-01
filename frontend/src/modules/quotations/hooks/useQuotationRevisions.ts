import { useQuery } from '@tanstack/react-query'
import { getQuotationRevisions } from '../api/quotations.api'
import { quotationKeys } from './useQuotations'

export function useQuotationRevisions(quotationId: number | null) {
  return useQuery({
    queryKey: quotationKeys.revisions(quotationId),
    queryFn: () => getQuotationRevisions(quotationId as number),
    enabled: quotationId !== null,
  })
}
