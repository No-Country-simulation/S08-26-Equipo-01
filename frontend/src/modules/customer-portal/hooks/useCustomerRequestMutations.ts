import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  addCustomerRequestDocumentVersion,
  cancelCustomerRequest,
  createCustomerRequestDocument,
  removeCustomerRequestDocument,
  respondCustomerInformationRequest,
  submitCustomerRequest,
} from '../api/customerRequests.api'
import type {
  CancelCustomerRequestPayload,
  RequestDocumentUpload,
  RespondInformationPayload,
  SubmitCustomerRequestInput,
} from '../types/customerRequest.types'
import { customerRequestKeys } from './useCustomerRequests'

export function useSubmitCustomerRequest(customerId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: SubmitCustomerRequestInput) =>
      submitCustomerRequest(customerId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: customerRequestKeys.list(customerId),
      }),
  })
}

export function useCustomerRequestActions(
  customerId: number,
  requestId: number,
) {
  const queryClient = useQueryClient()

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: customerRequestKeys.list(customerId),
      }),
      queryClient.invalidateQueries({
        queryKey: customerRequestKeys.detail(customerId, requestId),
      }),
    ])
  }

  const respond = useMutation({
    mutationFn: ({
      informationRequestId,
      payload,
    }: {
      informationRequestId: number
      payload: RespondInformationPayload
    }) =>
      respondCustomerInformationRequest(
        customerId,
        requestId,
        informationRequestId,
        payload,
      ),
    onSuccess: refresh,
  })

  const cancel = useMutation({
    mutationFn: (payload: CancelCustomerRequestPayload) =>
      cancelCustomerRequest(customerId, requestId, payload),
    onSuccess: refresh,
  })

  const addDocument = useMutation({
    mutationFn: (input: RequestDocumentUpload) =>
      createCustomerRequestDocument(customerId, requestId, input),
    onSuccess: refresh,
  })

  const addVersion = useMutation({
    mutationFn: ({ documentId, file }: { documentId: number; file: File }) =>
      addCustomerRequestDocumentVersion(
        customerId,
        requestId,
        documentId,
        file,
      ),
    onSuccess: refresh,
  })

  const removeDocument = useMutation({
    mutationFn: (documentId: number) =>
      removeCustomerRequestDocument(customerId, requestId, documentId),
    onSuccess: refresh,
  })

  return { respond, cancel, addDocument, addVersion, removeDocument }
}
