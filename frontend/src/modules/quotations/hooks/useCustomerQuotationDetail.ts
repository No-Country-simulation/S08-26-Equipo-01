import { useQuery } from '@tanstack/react-query'
import {
  getCustomerQuotation,
  getCustomerQuotationRevisions,
} from '../api/customerQuotations.api'
import { customerQuotationKeys } from './useCustomerQuotations'

export function useCustomerQuotationDetail(
  customerId: number,
  quotationId: number | null,
) {
  return useQuery({
    queryKey: customerQuotationKeys.detail(customerId, quotationId),
    queryFn: () => getCustomerQuotation(customerId, quotationId as number),
    enabled: quotationId !== null,
  })
}

export function useCustomerQuotationRevisions(
  customerId: number,
  quotationId: number | null,
) {
  return useQuery({
    queryKey: customerQuotationKeys.revisions(customerId, quotationId),
    queryFn: () =>
      getCustomerQuotationRevisions(customerId, quotationId as number),
    enabled: quotationId !== null,
  })
}
