import { useQuery } from '@tanstack/react-query'
import { getQuotations } from '../api/quotations.api'

export const quotationKeys = {
  all: ['quotations'] as const,
  list: () => [...quotationKeys.all, 'list'] as const,
  detail: (quotationId: number | null) =>
    [...quotationKeys.all, 'detail', quotationId] as const,
  revisions: (quotationId: number | null) =>
    [...quotationKeys.all, 'revisions', quotationId] as const,
}

export function useQuotations(enabled = true) {
  return useQuery({
    queryKey: quotationKeys.list(),
    queryFn: getQuotations,
    enabled,
  })
}
