import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createQuotation,
  createQuotationRevision,
  cancelQuotation,
  sendQuotation,
  updateQuotation,
} from '../api/quotations.api'
import type {
  CancelQuotationPayload,
  SendQuotationPayload,
  UpdateQuotationPayload,
} from '../types/quotation.types'
import { quotationKeys } from './useQuotations'

export function useCreateQuotation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (caseId: number) => createQuotation(caseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: quotationKeys.list(),
      })
    },
  })
}

function useRefreshQuotation(quotationId: number) {
  const queryClient = useQueryClient()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: quotationKeys.list(),
      }),
      queryClient.invalidateQueries({
        queryKey: quotationKeys.detail(quotationId),
      }),
      queryClient.invalidateQueries({
        queryKey: quotationKeys.revisions(quotationId),
      }),
    ])
}

export function useUpdateQuotation(quotationId: number) {
  const refresh = useRefreshQuotation(quotationId)

  return useMutation({
    mutationFn: (payload: UpdateQuotationPayload) =>
      updateQuotation(quotationId, payload),
    onSuccess: refresh,
  })
}

export function useSendQuotation(quotationId: number) {
  const refresh = useRefreshQuotation(quotationId)

  return useMutation({
    mutationFn: (payload?: SendQuotationPayload) =>
      sendQuotation(quotationId, payload),
    onSuccess: refresh,
  })
}

export function useCreateQuotationRevision(quotationId: number) {
  const refresh = useRefreshQuotation(quotationId)

  return useMutation({
    mutationFn: () => createQuotationRevision(quotationId),
    onSuccess: refresh,
  })
}


export function useCancelQuotation(quotationId: number) {
  const refresh = useRefreshQuotation(quotationId)

  return useMutation({
    mutationFn: (payload: CancelQuotationPayload) =>
      cancelQuotation(quotationId, payload),
    onSuccess: refresh,
  })
}
