export const CUSTOMER_QUOTATION_STATUSES = [
  'SENT',
  'ADJUSTMENT_REQUESTED',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
  'REPLACED',
] as const

export type CustomerQuotationStatus =
  (typeof CUSTOMER_QUOTATION_STATUSES)[number]

export interface CustomerQuotationSummaryDto {
  id: number
  caseNumber: string
  requestNumber: string
  requestTitle: string
  quotationNumber: string
  revision: number
  customerStatus: CustomerQuotationStatus
  currency: string
  subtotal: number
  taxRate: number
  tax: number
  total: number
  validUntil: string | null
  estimatedDeliveryDate: string | null
  sentAt: string | null
  approvedAt: string | null
  rejectedAt: string | null
  cancelledAt: string | null
}

export interface CustomerQuotationSourceDto {
  title: string
  quantity: number
  materialRequirementType: 'SPECIFIED' | 'ASSISTANCE_REQUIRED'
  materialRequirement: string | null
  materialName: string | null
  standardOrGrade: string | null
  requestedDeliveryDate: string | null
}

export interface CustomerQuotationAdjustmentDto {
  notes: string | null
  response: string | null
}

export interface CustomerQuotationItemDto {
  id: number
  lineNumber: number
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface CustomerQuotationDetailDto extends CustomerQuotationSummaryDto {
  source: CustomerQuotationSourceDto
  adjustment: CustomerQuotationAdjustmentDto | null
  rejectionReason: string | null
  cancellationReason: string | null
  items: CustomerQuotationItemDto[]
}

export interface RequestCustomerQuotationAdjustmentPayload {
  notes: string
}

export interface RejectCustomerQuotationPayload {
  reason?: string
}
