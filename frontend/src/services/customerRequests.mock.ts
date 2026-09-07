import { CURRENT_CONTACT } from '@/features/CustomerRequests/constants'
import type {
  CreateCustomerRequestInput,
  CustomerRequest,
} from '@/features/CustomerRequests/types'

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

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

const nextRequestNumber = (): string => {
  const max = requests.reduce((acc, request) => {
    const current = Number(request.requestNumber.replace('REQ-', ''))
    return Number.isNaN(current) ? acc : Math.max(acc, current)
  }, 0)
  return `REQ-${String(max + 1).padStart(3, '0')}`
}

const buildCreatedRequest = (
  input: CreateCustomerRequestInput,
): CustomerRequest => {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    contactId: CURRENT_CONTACT.id,
    requestNumber: nextRequestNumber(),
    description: input.description,
    quantity: input.quantity,
    requestDeliveryDate: input.requestDeliveryDate,
    status: 'RECEIVED',
    receivedAt: now,
    createdAt: now,
  }
}

export const mockApi = {
  list: async (): Promise<CustomerRequest[]> => {
    await delay()
    return [...requests]
  },
  getById: async (id: string): Promise<CustomerRequest> => {
    await delay()
    const request = requests.find((item) => item.id === id)
    if (!request) {
      throw new Error('Solicitud no encontrada')
    }
    return request
  },
  create: async (
    input: CreateCustomerRequestInput,
  ): Promise<CustomerRequest> => {
    await delay()
    const created = buildCreatedRequest(input)
    requests = [created, ...requests]
    return created
  },
}