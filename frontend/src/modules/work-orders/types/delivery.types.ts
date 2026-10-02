import type { WorkOrderStatus } from './workOrder.types'

export type DeliveryStatus =
  'PENDING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'

export interface DeliveryDto {
  id: number
  workOrderId: number
  workOrderNumber: string
  quantity: number
  status: DeliveryStatus
  destinationLabel: string | null
  destinationContactName: string | null
  destinationAddress: string
  destinationCity: string
  destinationState: string
  destinationPostalCode: string
  destinationCountry: string
  destinationInstructions: string | null
  deliveryMethod: string
  carrier: string | null
  trackingNumber: string | null
  dispatchedAt: string | null
  dispatchedByUserId: number | null
  deliveredAt: string | null
  receivedByName: string | null
  deliveredByUserId: number | null
  evidenceDocumentId: number | null
  evidenceDocumentVersionId: number | null
  evidenceFileName: string | null
  createdByUserId: number
  cancelledAt: string | null
  cancelledByUserId: number | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateDeliveryPayload {
  quantity: number
  destinationLabel?: string
  destinationContactName?: string
  destinationAddress: string
  destinationCity: string
  destinationState: string
  destinationPostalCode: string
  destinationCountry: string
  destinationInstructions?: string
  deliveryMethod: string
}

export interface DispatchDeliveryPayload {
  carrier?: string
  trackingNumber?: string
}

export interface CompleteDeliveryPayload {
  receivedByName: string
  deliveredAt: string
  evidenceDocumentVersionId?: number
}

export interface AttachDeliveryEvidencePayload {
  documentVersionId: number
}

export interface CancelDeliveryPayload {
  reason: string
}

export interface DeliveryQueueItem {
  workOrderId: number
  workOrderNumber: string
  workOrderStatus: WorkOrderStatus
  customerName: string
  plannedQuantity: number
  availableQuantity: number
  delivery: DeliveryDto | null
}
