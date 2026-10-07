import { useQuery } from '@tanstack/react-query'
import {
  getCustomerRequest,
  getCustomerRequests,
  getCustomerRequestDocumentVersions,
} from '../api/customerRequests.api'

export const customerRequestKeys = {
  all: ['customer-requests'] as const,
  lists: () => [...customerRequestKeys.all, 'list'] as const,
  list: (customerId: number) =>
    [...customerRequestKeys.lists(), customerId] as const,
  details: () => [...customerRequestKeys.all, 'detail'] as const,
  detail: (customerId: number, requestId: number) =>
    [...customerRequestKeys.details(), customerId, requestId] as const,
  documentVersions: (
    customerId: number,
    requestId: number,
    documentId: number,
  ) =>
    [
      ...customerRequestKeys.all,
      'document-versions',
      customerId,
      requestId,
      documentId,
    ] as const,
}

export function useCustomerRequests(customerId: number) {
  return useQuery({
    queryKey: customerRequestKeys.list(customerId),
    queryFn: () => getCustomerRequests(customerId),
  })
}

export function useCustomerRequestDetail(
  customerId: number,
  requestId: number | null,
) {
  return useQuery({
    queryKey: customerRequestKeys.detail(customerId, requestId ?? 0),
    queryFn: () => getCustomerRequest(customerId, requestId ?? 0),
    enabled: requestId !== null,
  })
}

export function useCustomerRequestDocumentVersions(
  customerId: number,
  requestId: number,
  documentId: number | null,
) {
  return useQuery({
    queryKey: customerRequestKeys.documentVersions(
      customerId,
      requestId,
      documentId ?? 0,
    ),
    queryFn: () =>
      getCustomerRequestDocumentVersions(
        customerId,
        requestId,
        documentId ?? 0,
      ),
    enabled: documentId !== null,
  })
}
