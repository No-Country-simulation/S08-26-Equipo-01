export const WORK_ORDER_STATUSES = [
  'CREATED',
  'READY_FOR_PRODUCTION',
  'IN_PRODUCTION',
  'QUALITY_PENDING',
  'QUALITY_HOLD',
  'REWORK_IN_PROGRESS',
  'READY_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
] as const

export const WORK_ORDER_PRIORITIES = [
  'LOW',
  'NORMAL',
  'HIGH',
  'URGENT',
] as const

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number]
export type WorkOrderPriority = (typeof WORK_ORDER_PRIORITIES)[number]

export interface PendingWorkOrderDto {
  caseId: number
  caseNumber: string
  requestId: number
  requestNumber: string
  requestTitle: string
  customerId: number
  customerName: string
  quantity: number
  quotationId: number
  quotationNumber: string
  quotationRevision: number
  approvedAt: string
  estimatedDeliveryDate: string | null
}

export interface WorkOrderDto {
  id: number
  caseId: number
  caseNumber: string
  requestId: number
  requestNumber: string
  customerId: number
  customerName: string
  workOrderNumber: string
  status: WorkOrderStatus
  priority: WorkOrderPriority
  plannedQuantity: number | null
  plannedStartDate: string | null
  plannedEndDate: string | null
  agreedDeliveryDate: string | null
  approvedQuotationId: number
  approvedQuotationNumber: string
  approvedQuotationRevision: number
  createdByUserId: number
  createdByName: string | null
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkOrderFiltersValue {
  search: string
  status: WorkOrderStatus | 'ALL'
  priority: WorkOrderPriority | 'ALL'
}

export interface WorkOrderDocumentDto {
  id: number
  documentId: number
  documentName: string
  documentType: string
  documentVersionId: number
  version: number
  fileName: string
  mimeType: string
  fileSize: number
  checksum: string
  linkedByUserId: number
  linkedByName: string | null
  linkedAt: string
}

export type RequestDeliveryMode =
  | 'SAVED_ADDRESS'
  | 'CUSTOM_ADDRESS'
  | 'CUSTOMER_PICKUP'
  | 'DEFINE_LATER'

export interface WorkOrderDeliveryDestinationDto {
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

export interface WorkOrderSourceDto {
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
  materialRequirementType: string | null
  materialRequirement: string | null
  requestedDeliveryDate: string | null
  deliveryDestination: WorkOrderDeliveryDestinationDto
  requestedByUserId: number
  requestedByName: string | null
  materialSpecification: unknown | null
  documents: unknown[]
  informationRequests: unknown[]
}

export interface WorkOrderAgreementDto {
  quotationId: number
  quotationNumber: string
  revision: number
  approvedAt: string | null
  estimatedDeliveryDate: string | null
}

export interface WorkOrderDetailDto {
  id: number
  workOrderNumber: string
  status: WorkOrderStatus
  priority: WorkOrderPriority
  plannedQuantity: number | null
  plannedStartDate: string | null
  plannedEndDate: string | null
  agreedDeliveryDate: string | null
  actualStartAt: string | null
  actualEndAt: string | null
  createdByUserId: number
  createdByName: string | null
  cancelledByUserId: number | null
  cancelledByName: string | null
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
  source: WorkOrderSourceDto
  agreement: WorkOrderAgreementDto
  pinnedDocuments: WorkOrderDocumentDto[]
}

export type RoutingSheetStatus = 'DRAFT' | 'APPROVED' | 'RELEASED'
export type RoutingPurpose = 'PRODUCTION' | 'REWORK'

export interface RoutingOperationDto {
  id: number
  sequenceNumber: number
  code: string
  name: string
  instructions: string | null
  estimatedMinutes: number
  prerequisiteOperationIds?: number[]
  createdAt: string
  updatedAt: string
}

export interface RoutingSheetDto {
  id: number
  workOrderId: number
  workOrderNumber: string
  workOrderStatus: WorkOrderStatus
  revision: number
  purpose: RoutingPurpose
  status: RoutingSheetStatus
  nonConformityId: number | null
  totalEstimatedMinutes: number
  operations: RoutingOperationDto[]
  createdByUserId: number
  createdByName: string | null
  approvedByUserId: number | null
  approvedByName: string | null
  approvedAt: string | null
  releasedByUserId: number | null
  releasedByName: string | null
  releasedAt: string | null
  createdAt: string
  updatedAt: string
}

export type OperationExecutionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface OperationExecutionDto {
  id: number
  workOrderId: number
  workOrderNumber: string
  workOrderStatus: WorkOrderStatus
  routingSheetId: number
  routingRevision: number
  routingPurpose: RoutingPurpose
  routingOperationId: number
  sequenceNumber: number
  operationCode: string
  operationName: string
  attemptNumber: number
  status: OperationExecutionStatus
  operatorId: number
  operatorName: string | null
  machineId: number | null
  machineCode: string | null
  machineName: string | null
  startedAt: string
  finishedAt: string | null
  quantityProcessed: number
  quantityAccepted: number
  quantityRejected: number
  startNotes: string | null
  completionNotes: string | null
  cancellationReason: string | null
}

export interface ProductionStatusDto {
  workOrderId: number
  workOrderNumber: string
  status: WorkOrderStatus
  plannedQuantity: number | null
  actualStartAt: string | null
  actualEndAt: string | null
  productionCompleted: boolean
  executions: OperationExecutionDto[]
}

export interface CreateWorkOrderPayload {
  priority: WorkOrderPriority
  plannedStartDate: string
  plannedEndDate: string
}

export interface UpdateWorkOrderPlanningPayload {
  priority: WorkOrderPriority
  plannedStartDate: string
  plannedEndDate: string
}

export interface RoutingOperationPayload {
  sequenceNumber: number
  code: string
  name: string
  instructions: string
  estimatedMinutes: number
  prerequisiteOperationIds: number[]
  resequenceOperations: boolean
}

export interface ReopenRoutingSheetPayload {
  reason: string
}

export interface CancelWorkOrderPayload {
  reason?: string
}

export interface StartOperationExecutionPayload {
  machineId?: number
  startNotes?: string
}

export interface CompleteOperationExecutionPayload {
  quantityProcessed: number
  quantityAccepted: number
  quantityRejected: number
  completionNotes?: string
}

export interface CancelOperationExecutionPayload {
  cancellationReason: string
}
