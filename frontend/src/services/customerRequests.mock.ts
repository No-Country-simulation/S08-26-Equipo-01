import { CURRENT_CONTACT } from '@/features/CustomerRequests/constants'
import {
  CANCELLATION_NOT_ALLOWED_MESSAGE,
  REQUEST_NOT_FOUND_MESSAGE,
} from '@/features/CustomerRequests/constants'
import { buildCreatedRequest } from '@/features/CustomerRequests/helpers/buildCreatedRequest'
import { delay } from '@/features/CustomerRequests/helpers/delay'
import { toSummary } from '@/features/CustomerRequests/helpers/toSummary'
import type {
  CreateCustomerRequestInput,
  CustomerRequest,
  CustomerRequestSummary,
} from '@/features/CustomerRequests/types'

const seedRequests: CustomerRequest[] = [
  {
    id: 'req-001',
    contactId: CURRENT_CONTACT.id,
    requestNumber: 'REQ-001',
    description:
      'Lote de ejes de transmisión en acero AISI 4140, según plano QT-118-B, con tolerancias de ±0.02 mm y tratamiento térmico.',
    quantity: 120,
    requestDeliveryDate: '2026-10-15',
    status: 'RECEIVED',
    receivedAt: '2026-09-01T10:00:00.000Z',
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'req-002',
    contactId: CURRENT_CONTACT.id,
    requestNumber: 'REQ-002',
    description:
      'Bridas de acero inoxidable 304, 4 pulgadas, para sistema de tuberías. Material certificado y marcado por norma.',
    quantity: 45,
    requestDeliveryDate: '2026-10-28',
    status: 'UNDER_REVIEW',
    receivedAt: '2026-09-04T09:30:00.000Z',
    createdAt: '2026-09-04T09:30:00.000Z',
  },
  {
    id: 'req-003',
    contactId: CURRENT_CONTACT.id,
    requestNumber: 'REQ-003',
    description:
      'Engranajes helicoidales de módulo 2.5 con dureza 58-62 HRC, rectificado final de precisión y plano de control dimensional.',
    quantity: 80,
    requestDeliveryDate: '2026-11-10',
    status: 'QUOTED',
    receivedAt: '2026-09-06T14:45:00.000Z',
    createdAt: '2026-09-06T14:45:00.000Z',
  },
]

let requests: CustomerRequest[] = [...seedRequests]

export const mockApi = {
  list: async (): Promise<CustomerRequestSummary[]> => {
    await delay()
    return requests.map(toSummary)
  },
  getById: async (id: string): Promise<CustomerRequest> => {
    await delay()
    const request = requests.find((item) => item.id === id)
    if (!request) {
      throw new Error(REQUEST_NOT_FOUND_MESSAGE)
    }
    return request
  },
  create: async (
    input: CreateCustomerRequestInput,
  ): Promise<CustomerRequest> => {
    await delay()
    const created = buildCreatedRequest(input, requests)
    requests = [created, ...requests]
    return created
  },
  cancel: async (id: string): Promise<CustomerRequest> => {
    await delay()
    const request = requests.find((item) => item.id === id)
    if (!request) {
      throw new Error(REQUEST_NOT_FOUND_MESSAGE)
    }
    if (request.status !== 'RECEIVED') {
      throw new Error(CANCELLATION_NOT_ALLOWED_MESSAGE)
    }
    const cancelled: CustomerRequest = {
      ...request,
      status: 'CANCELLED',
    }
    requests = requests.map((item) => (item.id === id ? cancelled : item))
    return cancelled
  },
}