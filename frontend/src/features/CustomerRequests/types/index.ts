export type CustomerRequestStatus =
  | 'RECEIVED'
  | 'UNDER_REVIEW'
  | 'FEASIBLE'
  | 'REJECTED'
  | 'QUOTED'
  | 'CANCELLED'

export interface CustomerContact {
  id: string
  customerId: string
  name: string
  position: string
  email: string
  phone: string
}

export interface CustomerRequestSummary {
  id: string
  requestNumber: string
  description: string
  quantity: number
  requestDeliveryDate: string
  status: CustomerRequestStatus
}

export interface CustomerRequest extends CustomerRequestSummary {
  contactId: string
  receivedAt: string
  createdAt: string
}

export interface CreateCustomerRequestInput {
  description: string
  quantity: number
  requestDeliveryDate: string
}