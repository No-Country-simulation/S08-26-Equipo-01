export type CustomerDeliveryStatus = 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'

export interface CustomerDeliveryDto {
  id: number
  workOrderNumber: string
  quantity: number
  status: CustomerDeliveryStatus
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
  deliveredAt: string | null
  receivedByName: string | null
  evidenceDocumentId: number | null
  evidenceDocumentVersionId: number | null
  evidenceFileName: string | null
}
