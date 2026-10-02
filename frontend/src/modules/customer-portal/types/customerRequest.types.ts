export type MaterialRequirementType = 'SPECIFIED' | 'ASSISTANCE_REQUIRED'

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

export type CustomerRequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'WAITING_CUSTOMER_INFO'
  | 'READY_FOR_QUOTATION'
  | 'IN_PRODUCTION'
  | 'COMPLETED'
  | 'CANCELLED'

export interface CustomerRequestJobCaseDto {
  id: number
  caseNumber: string
  status: CustomerRequestStatus
  assignedToName: string | null
  assignedAt: string | null
  openedAt: string
  closedAt: string | null
  cancelledByUserId: number | null
  cancelledAt: string | null
  cancellationReason: string | null
}

export interface CustomerRequestSummaryDto {
  id: number
  customerId: number
  requestNumber: string
  customerReference: string | null
  title: string
  description: string
  quantity: number
  materialRequirementType: MaterialRequirementType
  materialRequirement: string
  requestedDeliveryDate: string | null
  deliveryDestination: RequestDeliveryDestinationDto
  requestedByUserId: number
  requestedByName: string
  createdAt: string
  updatedAt: string
  jobCase: CustomerRequestJobCaseDto
}

export interface CustomerInformationRequestDto {
  id: number
  question: string
  requestedByName: string | null
  requestedAt: string
  response: string | null
  respondedByName: string | null
  respondedAt: string | null
  open: boolean
}

export interface RequestDocumentVersionDto {
  id: number
  version: number
  fileName: string
  mimeType: string
  fileSize: number
  checksum: string
  uploadedByUserId: number
  uploadedByName: string | null
  uploadedAt: string
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

export interface CustomerRequestDetailDto extends CustomerRequestSummaryDto {
  documents: RequestDocumentDto[]
  informationRequests: CustomerInformationRequestDto[]
}

export interface RequestDocumentUpload {
  documentType?: string
  name?: string
  description?: string
  file: File
}

export interface SubmitCustomerRequestInput {
  customerReference?: string
  title: string
  description: string
  quantity: number
  materialRequirementType: MaterialRequirementType
  materialRequirement: string
  requestedDeliveryDate?: string
  deliveryMode: RequestDeliveryMode
  customerAddressId?: number
  deliveryLabel?: string
  deliveryAddress?: string
  deliveryCity?: string
  deliveryState?: string
  deliveryPostalCode?: string
  deliveryCountry?: string
  deliveryContactName?: string
  deliveryContactPhone?: string
  deliveryInstructions?: string
  documents: RequestDocumentUpload[]
}

export interface RespondInformationPayload {
  response: string
}

export interface CancelCustomerRequestPayload {
  reason?: string
}
