export type DocumentContextDto = 'CASE' | 'WORK_ORDER' | 'MATERIAL' | 'DELIVERY'

export interface DocumentCenterVersionDto {
  id: number
  version: number
  fileName: string
  mimeType: string
  fileSize: number
  checksum: string
  uploadedByUserId: number
  uploadedByName: string
  uploadedAt: string
}

export interface DocumentReferenceDto {
  context: DocumentContextDto
  resourceId: number
  documentVersionId: number
  version: number
}

export interface DocumentCenterDto {
  id: number
  caseId: number | null
  requestId: number | null
  customerId: number | null
  customerName: string | null
  requestNumber: string | null
  caseNumber: string | null
  documentType: string
  name: string
  description: string | null
  createdByUserId: number
  createdByName: string
  createdAt: string
  currentVersion: DocumentCenterVersionDto
  contexts: DocumentContextDto[]
  workOrderIds: number[]
  workOrderNumbers: string[]
  materialLotIds: number[]
  materialLotNumbers: string[]
  deliveryIds: number[]
  references: DocumentReferenceDto[]
}
