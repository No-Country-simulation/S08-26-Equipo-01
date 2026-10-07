export const JOB_CASE_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'WAITING_CUSTOMER_INFO',
  'READY_FOR_QUOTATION',
  'AWAITING_WORK_ORDER',
  'IN_PRODUCTION',
  'COMPLETED',
  'CANCELLED',
] as const

export const MATERIAL_REQUIREMENT_TYPES = [
  'SPECIFIED',
  'ASSISTANCE_REQUIRED',
] as const

export type JobCaseStatus = (typeof JOB_CASE_STATUSES)[number]
export type MaterialRequirementType =
  (typeof MATERIAL_REQUIREMENT_TYPES)[number]

export type RequestDeliveryMode =
  | 'SAVED_ADDRESS'
  | 'CUSTOM_ADDRESS'
  | 'CUSTOMER_PICKUP'
  | 'DEFINE_LATER'

export interface RequestDeliveryDestinationDto {
  id: number
  mode: RequestDeliveryMode
  sourceCustomerAddressId: number | null
  label: string | null
  address: string | null
  city: string | null
  state: string | null
  postalCode: string | null
  country: string | null
  contactName: string | null
  contactPhone: string | null
  deliveryInstructions: string | null
  createdAt: string
}

export interface JobCaseRequestSummaryDto {
  id: number
  customerId: number
  customerName: string
  requestNumber: string
  customerReference: string | null
  title: string
  description: string | null
  quantity: number
  materialRequirementType: MaterialRequirementType
  materialRequirement: string | null
  requestedDeliveryDate: string | null
  deliveryDestination: RequestDeliveryDestinationDto
  requestedByUserId: number
  requestedByName: string | null
  submittedAt: string
}

export interface JobCaseDto {
  id: number
  caseNumber: string
  status: JobCaseStatus
  assignedToUserId: number | null
  assignedToName: string | null
  assignedAt: string | null
  openedAt: string | null
  closedAt: string | null
  cancelledByUserId: number | null
  cancelledByName: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  request: JobCaseRequestSummaryDto
}

export interface JobCaseFiltersValue {
  search: string
  status: JobCaseStatus | 'ALL'
  assignment: 'ALL' | 'ASSIGNED' | 'UNASSIGNED'
}

export interface JobCaseDocumentVersionDto {
  id: number
  version: number
  fileName: string
  mimeType: string
  fileSize: number
  checksum: string
  uploadedByUserId: number
  uploadedByName: string | null
  uploadedAt: string
}

export interface RequestDocumentVersionDto extends JobCaseDocumentVersionDto {
  contentUrl: string
  downloadUrl: string
}

export interface RequestDocumentDto {
  id: number
  documentType: string
  name: string
  description: string | null
  createdByUserId: number
  createdByName: string | null
  createdAt: string
  currentVersion: RequestDocumentVersionDto
}

export interface CaseInformationRequestDto {
  id: number
  question: string
  requestedByUserId: number
  requestedByName: string | null
  requestedAt: string
  response: string | null
  respondedByUserId: number | null
  respondedByName: string | null
  respondedAt: string | null
  open: boolean
}

export interface CaseMaterialSpecificationDto {
  id: number
  materialName: string
  standardOrGrade: string | null
  technicalNotes: string | null
  definedByUserId: number
  definedByName: string | null
  definedAt: string
}

export interface JobCaseDetailDto extends JobCaseDto {
  documents: RequestDocumentDto[]
  informationRequests: CaseInformationRequestDto[]
  materialSpecification: CaseMaterialSpecificationDto | null
}

export type JobCaseTraceabilityActionType =
  | 'VIEW_CUSTOMER_REQUEST'
  | 'VIEW_JOB_CASE'
  | 'VIEW_QUOTATION'
  | 'VIEW_WORK_ORDER'
  | 'VIEW_ROUTING_SHEET'
  | 'VIEW_ROUTING_OPERATION'
  | 'VIEW_OPERATION_EXECUTION'
  | 'VIEW_DOCUMENT'
  | 'VIEW_DOCUMENT_VERSION'
  | 'VIEW_MATERIAL_LOT'
  | 'VIEW_QUALITY_INSPECTION'
  | 'VIEW_QUALITY_MEASUREMENT'
  | 'VIEW_QUALITY_CHECK'
  | 'VIEW_NON_CONFORMITY'
  | 'VIEW_DELIVERY'

export interface JobCaseTraceabilityActionDto {
  type: JobCaseTraceabilityActionType
  label: string
  resourceType: string
  resourceId: number
}

export interface JobCaseTimelineEventDto {
  id: number
  aggregateType: string
  aggregateId: number
  eventType: string
  fromStatus: string | null
  toStatus: string | null
  performedByUserId: number | null
  performedByName: string | null
  metadata: Record<string, unknown>
  occurredAt: string
  actions: JobCaseTraceabilityActionDto[]
}

export interface JobCaseTimelinePageDto {
  items: JobCaseTimelineEventDto[]
  nextCursor: string | null
  hasMore: boolean
}

export interface CreateInformationRequestPayload {
  question: string
}

export interface DefineMaterialSpecificationPayload {
  materialName: string
  standardOrGrade: string
  technicalNotes: string
}

