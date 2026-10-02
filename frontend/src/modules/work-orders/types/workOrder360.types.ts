import type { MaterialLotDto, WorkOrderMaterialDto } from '@/modules/materials'
import type { QuotationDto } from '@/modules/quotations'
import type { DeliveryDto } from './delivery.types'
import type { NonConformityDto, QualityInspectionDto } from './quality.types'
import type {
  ProductionStatusDto,
  RoutingSheetDto,
  WorkOrderDetailDto,
} from './workOrder.types'

export interface TraceabilitySnapshotDto {
  fromStatus: string | null
  toStatus: string | null
  details: Record<string, unknown>
}

export type TraceabilityActionType =
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

export interface TraceabilityActionDto {
  type: TraceabilityActionType
  label: string
  resourceType: string
  resourceId: number
}

export interface TraceabilityEventDto {
  id: number
  aggregateType: string
  aggregateId: number
  eventType: string
  performedByUserId: number | null
  performedByName: string | null
  occurredAt: string
  snapshot: TraceabilitySnapshotDto
  actions: TraceabilityActionDto[]
}

export interface DocumentVersionDto {
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

export type WorkOrderDocumentContext =
  | 'CASE'
  | 'WORK_ORDER'
  | 'MATERIAL'
  | 'DELIVERY'

export interface DocumentCenterDto {
  id: number
  caseId: number | null
  documentType: string
  name: string
  description: string | null
  createdByName: string | null
  createdAt: string
  currentVersion: DocumentVersionDto
  contexts: WorkOrderDocumentContext[]
  materialLotNumbers: string[]
  deliveryIds: number[]
}

export interface WorkOrder360DocumentDto {
  document: DocumentCenterDto
  versions: DocumentVersionDto[]
}

export interface WorkOrder360MaterialDto {
  consumption: WorkOrderMaterialDto
  lot: MaterialLotDto
}

export interface WorkOrder360Dto {
  workOrder: WorkOrderDetailDto
  quotationRevisions: QuotationDto[]
  routingSheets: RoutingSheetDto[]
  production: ProductionStatusDto
  materials: WorkOrder360MaterialDto[]
  qualityInspections: QualityInspectionDto[]
  nonConformities: NonConformityDto[]
  documents: WorkOrder360DocumentDto[]
  deliveries: DeliveryDto[]
  timeline: TraceabilityEventDto[]
}

export type { QualityInspectionDto } from './quality.types'
