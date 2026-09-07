export type CustomerRequestStatus =
  | 'RECEIVED'
  | 'UNDER_REVIEW'
  | 'FEASIBLE'
  | 'REJECTED'
  | 'QUOTED'

export interface CustomerContact {
  id: string
  customerId: string
  name: string
  position: string
  email: string
  phone: string
}

export interface CustomerRequest {
  id: string
  contactId: string
  requestNumber: string
  description: string
  quantity: number
  requestDeliveryDate: string
  status: CustomerRequestStatus
  receivedAt: string
  createdAt: string
}

export interface CreateCustomerRequestInput {
  description: string
  quantity: number
  requestDeliveryDate: string
}