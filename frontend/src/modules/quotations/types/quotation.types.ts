export const QUOTATION_STATUSES = [
  'DRAFT',
  'ADJUSTMENT_REQUESTED',
  'SENT',
  'APPROVED',
  'REJECTED',
  'SUPERSEDED',
  'EXPIRED',
  'CANCELLED',
] as const

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number]

export interface QuotationDto {
  id: number
  caseId: number
  caseNumber: string
  requestId: number
  requestNumber: string
  customerId: number
  customerName: string
  quotationNumber: string
  revision: number
  status: QuotationStatus
  currency: string
  subtotal: number
  taxRate: number
  tax: number
  total: number
  validUntil: string | null
  estimatedDeliveryDate: string | null
  createdByUserId: number
  createdByName: string | null
  sentAt: string | null
  approvedAt: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface QuotationFiltersValue {
  search: string
  status: QuotationStatus | 'ACTIVE' | 'ALL'
}

export interface QuotationItemDto {
  id: number
  lineNumber: number
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface QuotationMaterialSpecificationDto {
  id: number
  materialName: string
  standardOrGrade: string | null
  technicalNotes: string | null
  definedByUserId: number
  definedByName: string | null
  definedAt: string
}

export interface QuotationSourceDto {
  caseId: number
  caseNumber: string
  requestId: number
  requestNumber: string
  customerId: number
  customerName: string
  customerReference: string | null
  title: string
  description: string | null
  quantity: number
  materialRequirementType: 'SPECIFIED' | 'ASSISTANCE_REQUIRED'
  materialRequirement: string | null
  requestedDeliveryDate: string | null
  requestedByUserId: number
  requestedByName: string | null
  assignedToUserId: number | null
  assignedToName: string | null
  materialSpecification: QuotationMaterialSpecificationDto | null
  documents: unknown[]
  informationRequests: unknown[]
}

export interface QuotationDetailDto extends QuotationDto {
  source: QuotationSourceDto
  adjustmentNotes: string | null
  adjustmentResponse: string | null
  rejectedAt: string | null
  rejectionReason: string | null
  cancellationReason: string | null
  items: QuotationItemDto[]
}

export interface QuotationItemPayload {
  id?: number
  description: string
  quantity: number
  unitPrice: number
}

export interface UpdateQuotationPayload {
  currency: string
  taxRate: number
  validUntil: string | null
  estimatedDeliveryDate: string | null
  items: QuotationItemPayload[]
}

export interface SendQuotationPayload {
  adjustmentResponse?: string
}

export interface CancelQuotationPayload {
  reason?: string
}
