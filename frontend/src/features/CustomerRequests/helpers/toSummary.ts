import type { CustomerRequest, CustomerRequestSummary } from '../types'

export const toSummary = (
  request: CustomerRequest,
): CustomerRequestSummary => ({
  id: request.id,
  requestNumber: request.requestNumber,
  description: request.description,
  quantity: request.quantity,
  requestDeliveryDate: request.requestDeliveryDate,
  status: request.status,
})