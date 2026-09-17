import { CURRENT_CONTACT } from '../constants'
import type { CreateCustomerRequestInput, CustomerRequest } from '../types'
import { nextRequestNumber } from './requestNumber'

export const buildCreatedRequest = (
  input: CreateCustomerRequestInput,
  requests: CustomerRequest[],
): CustomerRequest => {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    contactId: CURRENT_CONTACT.id,
    requestNumber: nextRequestNumber(requests),
    description: input.description,
    quantity: input.quantity,
    requestDeliveryDate: input.requestDeliveryDate,
    status: 'RECEIVED',
    receivedAt: now,
    createdAt: now,
  }
}