import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  approveCustomerQuotation,
  rejectCustomerQuotation,
  requestCustomerQuotationAdjustment,
} from '../api/customerQuotations.api'
import type {
  RejectCustomerQuotationPayload,
  RequestCustomerQuotationAdjustmentPayload,
} from '../types/customerQuotation.types'
import { customerQuotationKeys } from './useCustomerQuotations'

function useRefreshCustomerQuotation(customerId: number, quotationId: number) {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: customerQuotationKeys.list(customerId),
      }),
      queryClient.invalidateQueries({
        queryKey: customerQuotationKeys.detail(customerId, quotationId),
      }),
      queryClient.invalidateQueries({
        queryKey: customerQuotationKeys.revisions(customerId, quotationId),
      }),
    ])
}

export function useApproveCustomerQuotation(
  customerId: number,
  quotationId: number,
) {
  const refresh = useRefreshCustomerQuotation(customerId, quotationId)

  return useMutation({
    mutationFn: () => approveCustomerQuotation(customerId, quotationId),
    onSuccess: refresh,
  })
}

export function useRequestCustomerQuotationAdjustment(
  customerId: number,
  quotationId: number,
) {
  const refresh = useRefreshCustomerQuotation(customerId, quotationId)

  return useMutation({
    mutationFn: (payload: RequestCustomerQuotationAdjustmentPayload) =>
      requestCustomerQuotationAdjustment(customerId, quotationId, payload),
    onSuccess: refresh,
  })
}

export function useRejectCustomerQuotation(
  customerId: number,
  quotationId: number,
) {
  const refresh = useRefreshCustomerQuotation(customerId, quotationId)

  return useMutation({
    mutationFn: (payload: RejectCustomerQuotationPayload) =>
      rejectCustomerQuotation(customerId, quotationId, payload),
    onSuccess: refresh,
  })
}
